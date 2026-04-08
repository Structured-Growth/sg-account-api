import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createGroup } from "../../../common/create-group";
import { createUser } from "../../../common/create-user";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/groups/:groupId/members", () => {
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

	createCustomField(server, context, {
		orgId: (context) => context.organization.id,
		entity: "GroupMember",
		name: "memberRole",
		title: "Member Role",
	});

	it("Should add member to group", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/${context.group.id}/members`).send({
			userId: context.user.id,
			status: "active",
			metadata: {
				memberRole: "owner",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.equal(body.groupId, context.group.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.equal(body.metadata.memberRole, "owner");
		assert.isString(body.arn);
	});

	it("Should not add member if they already in a group", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/${context.group.id}/members`).send({
			userId: context.user.id,
			status: "active",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/string/members`).send({
			userId: -1,
			status: "activated",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.groupId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post(`/v1/groups/${context.group.id}/members`).send({
			userId: context.user2.id,
			status: "inactive",
			metadata: {
				memberRole: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.memberRole[0]);
	});
});
