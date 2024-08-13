import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createGroup } from "../../../common/create-group";
import { createUser } from "../../../common/create-user";

describe("GET /api/v1/groups/:groupId/members", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	createUser(server, context, {
		accountId: (context) => context.account.id,
		contextPath: "user",
	});

	createUser(server, context, {
		accountId: (context) => context.account.id,
		contextPath: "user2",
	});

	createGroup(server, context, {
		accountId: (context) => context.account.id,
		contextPath: "group",
	});

	it("Should add member to group", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/${context.group.id}/members`).send({
			userId: context.user.id,
			status: "active",
		});
		assert.equal(statusCode, 201);
		context.groupMemberId = body.id;
	});

	it("Should add another member to group", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/${context.group.id}/members`).send({
			userId: context.user2.id,
			status: "active",
		});
		assert.equal(statusCode, 201);
		context.groupMember2Id = body.id;
	});

	it("Should return group members", async () => {
		const { statusCode, body } = await server.get(`/v1/groups/${context.group.id}/members`).query({
			"id[0]": context.groupMemberId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.groupMemberId);
		assert.equal(body.data[0].groupId, context.group.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.equal(body.data[0].userId, context.user.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return group", async () => {
		const { statusCode, body } = await server.get("/v1/groups").query({
			"id[0]": context.group.id,
			orgId: context.organization.id,
			accountId: context.account.id,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.group.id);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get(`/v1/groups/${context.group.id}/members`).query({
			groupId: 0,
			userId: 0,
			"status[0]": "invalid",
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.groupId[0]);
		assert.isString(body.validation.query.userId[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.page[0]);
		assert.isString(body.validation.query.limit[0]);
		assert.isString(body.validation.query.sort[0]);
	});
});
