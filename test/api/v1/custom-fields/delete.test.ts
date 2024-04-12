import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/custom-fields/:customFieldId", () => {
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

	it("Should delete custom field", async () => {
		const { statusCode, body } = await server.delete(`/v1/custom-fields/${context["customFieldId"]}`);
		assert.equal(statusCode, 204);
	});

	it("Should return not found error", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields/${context["customFieldId"]}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
