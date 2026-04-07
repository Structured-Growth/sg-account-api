import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";
import { createCustomField } from "../../../common/create-custom-field";

describe("PUT /api/v1/accounts/:accountId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createCustomField(server, context, {
		orgId: (context) => context.organization.id,
		entity: "Account",
		name: "accountType",
		title: "Account Type",
	});

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: context.organization.id,
			status: "inactive",
			metadata: {
				accountType: "patient",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.status, "inactive");
		assert.equal(body.metadata.accountType, "patient");
		context.accountId = body.id;
	});

	it("Should update account", async () => {
		const { statusCode, body } = await server.put(`/v1/accounts/${context.accountId}`).send({
			status: "archived",
			metadata: {
				accountType: "provider",
			},
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.equal(body.metadata.accountType, "provider");
		assert.isString(body.arn);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/accounts/${context.accountId}`).send({
			metadata: {
				accountType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.accountType[0]);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/accounts/${context.accountId}`).send({
			status: "deleted",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/accounts/9999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
