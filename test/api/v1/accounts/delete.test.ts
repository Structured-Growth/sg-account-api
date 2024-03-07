import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";

describe("DELETE /api/v1/accounts/:accountId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: context.organization.id,
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.status, "inactive");
		context.accountId = body.id;
	});

	it("Should delete account", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/${context.accountId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return is account does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/${context.accountId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
