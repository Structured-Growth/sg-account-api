import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("DELETE /api/v1/emails/:emailId", () => {
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

	it("Should create primary email", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "test@example.com",
		});
		assert.equal(statusCode, 201);
		context.emailId = body.id;
	});

	it("Should delete email", async () => {
		const { statusCode, body } = await server.delete(`/v1/emails/${context.emailId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return error if email doesn't exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/emails/${context.emailId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/emails/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.emailId[0]);
	});
});
