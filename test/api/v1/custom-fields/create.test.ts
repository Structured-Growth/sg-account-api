import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { joi } from "@structured-growth/microservice-sdk";

describe("POST /api/v1/custom-fields", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create custom field", async () => {
		const schema = joi.object({
			userType: joi.string().required().min(3).max(50),
		});

		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: context.organization.id,
			entity: "User",
			title: "User Type",
			name: "userType",
			schema: schema.describe().keys["userType"],
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.entity, "User");
		assert.equal(body.title, "User Type");
		assert.equal(body.name, "userType");
		assert.isObject(body.schema);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		context["customFieldId"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: -1,
			entity: "UserS",
			title: 1,
			name: false,
			schema: "string",
			status: "activeD",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.entity[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.name[0]);
		assert.isString(body.validation.body.schema[0]);
		assert.isString(body.validation.body.status[0]);
	});
});
