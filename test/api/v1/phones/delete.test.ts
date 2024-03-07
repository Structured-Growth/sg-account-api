import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("DELETE /api/v1/phones/:phoneId", () => {
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

	it("Should create primary phone", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112233",
		});
		assert.equal(statusCode, 201);
		context.phoneId = body.id;
	});

	it("Should delete phone", async () => {
		const { statusCode, body } = await server.delete(`/v1/phones/${context.phoneId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return error if phone doesn't exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/phones/${context.phoneId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/phones/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.phoneId[0]);
	});
});
