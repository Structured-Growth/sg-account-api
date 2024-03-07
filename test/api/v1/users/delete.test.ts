import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/users/:userId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: context.account.id,
			firstName: "firstname",
			lastName: "lastname",
			birthday: "1986-04-01",
			gender: "male",
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["userId"] = body.id;
	});

	it("Should delete user", async () => {
		const { statusCode, body } = await server.delete(`/v1/users/${context.userId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return if user does not exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/users/${context.userId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/users/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.userId[0]);
	});
});
