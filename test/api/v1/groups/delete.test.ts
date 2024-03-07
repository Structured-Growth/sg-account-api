import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/groups/:groupId", () => {
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

	it("Should delete group", async () => {
		const { statusCode, body } = await server.delete(`/v1/groups/${context.groupId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return error if group doesn't exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/groups/${context.groupId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/groups/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.groupId[0]);
	});
});
