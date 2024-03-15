import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createGroup } from "../../../common/create-group";
import { createUser } from "../../../common/create-user";

describe("GET /api/v1/groups/:groupId/members/:groupMemberId", () => {
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

	it("Should return group member", async () => {
		const { statusCode, body } = await server.get(`/v1/groups/${context.group.id}/members/${context.groupMemberId}`);
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.equal(body.groupId, context.group.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isString(body.arn);
	});
});
