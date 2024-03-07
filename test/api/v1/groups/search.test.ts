import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/groups", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create a group", async () => {
		const { statusCode, body } = await server.post("/v1/groups").send({
			accountId: context.account.id,
			title: `group-${context.account.id}`,
			status: "active",
		});
		assert.equal(statusCode, 201);
		context.groupId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/groups").query({
			orgId: "a",
			accountId: 0,
			parentGroupId: 0,
			title: 0,
			name: 0,
			"status[0]": "invalid",
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.parentGroupId[0]);
		assert.isString(body.validation.query.title[0]);
		assert.isString(body.validation.query.name[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.page[0]);
		assert.isString(body.validation.query.limit[0]);
		assert.isString(body.validation.query.sort[0]);
	});

	it("Should return group", async () => {
		const { statusCode, body } = await server.get("/v1/groups").query({
			"id[0]": context.groupId,
			orgId: context.organization.id,
			accountId: context.account.id,
			"status[0]": "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.groupId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].title, `group-${context.account.id}`);
		assert.equal(body.data[0].name, `group-${context.account.id}`);
		assert.equal(body.data[0].status, "active");
		assert.isNull(body.data[0].imageUrl);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});
});
