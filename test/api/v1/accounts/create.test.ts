import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { initTest } from "../../../common/init-test";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/accounts", function () {
	this.timeout(10000);
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
			status: "active",
			metadata: {
				accountType: "patient",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.equal(body.metadata.accountType, "patient");
		assert.isString(body.arn);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: context.organization.id,
			status: "active",
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
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: -1,
			status: "super",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.metadata[0]);
	});
});
