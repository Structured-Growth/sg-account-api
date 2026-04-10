import { assert } from "chai";
import "../src/app/providers";
import { initTest } from "./common/init-test";
import { createOrganization } from "./common/create-organization";
import { createAccount } from "./common/create-account";

describe("Test resolver", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should return resolved model", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/resolve").query({
			resource: "Unknown",
			id: 1,
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
	});

	it("Should return list of actions", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/actions");
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.equal(body.data.filter((item) => item.action.includes("resolve")).length, 4);
	});

	it("Should return list of models", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/models");
		assert.equal(statusCode, 200);
		assert.isString(body.data[0].resource);
	});

	it("Should validate custom fields payload", async () => {
		await server.post("/v1/custom-fields").send({
			orgId: context.organization.id,
			entity: "User",
			title: "User Type",
			name: "userType",
			schema: {
				type: "string",
				flags: { presence: "required" },
				rules: [{ name: "min", args: { limit: 3 } }],
			},
			status: "active",
		});

		const { statusCode, body } = await server.post("/v1/resolver/validate").send({
			entity: "User",
			orgId: context.organization.id,
			data: {
				userType: "doctor",
			},
		});
		assert.equal(statusCode, 200);
		assert.deepEqual(body, {
			valid: true,
		});
	});

	it("Should return validation errors for invalid custom fields payload", async () => {
		const { statusCode, body } = await server.post("/v1/resolver/validate").send({
			entity: "User",
			orgId: context.organization.id,
			data: {
				userType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.valid, false);
		assert.isString(body.errors.userType[0]);
	});

	it("Should return valid when orgId is omitted", async () => {
		const { statusCode, body } = await server.post("/v1/resolver/validate").send({
			entity: "User",
			data: {},
		});
		assert.equal(statusCode, 200);
		assert.deepEqual(body, {
			valid: true,
		});
	});
});
