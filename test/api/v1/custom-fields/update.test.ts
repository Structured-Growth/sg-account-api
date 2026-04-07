import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/custom-fields/:customFieldId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: context.organization.id,
			entity: "User",
			title: "User Type",
			name: "userType",
			schema: {
				type: "string",
				flags: { presence: "required" },
				rules: [
					{ name: "min", args: { limit: 3 } },
					{ name: "max", args: { limit: 50 } },
				],
			},
			status: "active",
		});
		assert.equal(statusCode, 201);
		context["customFieldId"] = body.id;
	});

	it("Should create second custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: context.organization.id,
			entity: "User",
			title: "Insurance Number",
			name: "insuranceNumber",
			schema: {
				type: "string",
			},
			status: "active",
		});
		assert.equal(statusCode, 201);
		context["secondCustomFieldId"] = body.id;
	});

	it("Should return created custom field", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields/${context["customFieldId"]}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context["customFieldId"]);
	});

	it("Should update custom field", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context["customFieldId"]}`).send({
			entity: "Group",
			title: "Updated title",
			name: "updatedUserType",
			schema: {
				type: "string",
				flags: { presence: "required" },
				rules: [{ name: "max", args: { limit: 100 } }],
			},
			status: "inactive",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context["customFieldId"]);
		assert.equal(body.entity, "Group");
		assert.equal(body.title, "Updated title");
		assert.equal(body.name, "updatedUserType");
		assert.equal(body.schema.type, "string");
		assert.equal(body.status, "inactive");
	});

	it("Should return validation error for invalid name characters", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context["customFieldId"]}`).send({
			name: "updated user type!",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return validation error when updating to duplicate name", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context["secondCustomFieldId"]}`).send({
			entity: "Group",
			name: "updatedUserType",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return updated custom field", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields/${context["customFieldId"]}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context["customFieldId"]);
		assert.equal(body.entity, "Group");
		assert.equal(body.title, "Updated title");
		assert.equal(body.name, "updatedUserType");
		assert.equal(body.status, "inactive");
	});
});
