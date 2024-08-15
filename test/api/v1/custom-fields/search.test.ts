import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/custom-fields", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createOrganization(server, context, {
		contextPath: "organization2",
		parentOrgId: (context) => context.organization.id,
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

	it("Should return custom field", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields`).query({
			orgId: context.organization.id,
			"id[]": context.customFieldId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.customFieldId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].entity, "User");
		assert.equal(body.data[0].title, "User Type");
		assert.equal(body.data[0].name, "userType");
		assert.equal(body.data[0].status, "active");
		assert.isObject(body.data[0].schema);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should not return inherited custom fields", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields`).query({
			orgId: context.organization2.id,
			"id[]": context.customFieldId,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.total, 0);
	});

	it("Should return inherited custom fields", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields`).query({
			orgId: context.organization2.id,
			"id[]": context.customFieldId,
			includeInherited: true,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.customFieldId);
		assert.equal(body.data[0].orgId, context.organization.id);
	});
});
