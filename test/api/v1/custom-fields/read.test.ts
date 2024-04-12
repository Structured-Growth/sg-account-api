import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/custom-fields/:customFieldId", () => {
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

	it("Should return custom field", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields/${context["customFieldId"]}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context["customFieldId"]);
		assert.equal(body.orgId, context.organization.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.entity, "User");
		assert.equal(body.title, "User Type");
		assert.equal(body.name, "userType");
		assert.equal(body.status, "active");
		assert.isObject(body.schema);
		assert.isString(body.arn);
	});
});
