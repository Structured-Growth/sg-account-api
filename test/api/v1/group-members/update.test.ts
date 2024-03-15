import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createGroup } from "../../../common/create-group";
import { createUser } from "../../../common/create-user";

describe("PUT /api/v1/groups/:groupId/members/:groupMemberId", () => {
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
		assert.equal(body.status, "active");
		context.groupMemberId = body.id;
	});

	it("Should update group member status", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/${context.group.id}/members/${context.groupMemberId}`).send({
			status: "inactive"
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.equal(body.groupId, context.group.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});
});
