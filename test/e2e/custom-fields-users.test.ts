import "../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../common/create-organization";
import { createAccount } from "../common/create-account";
import { initTest } from "../common/init-test";
import CustomField from "../../database/models/custom-field";

describe("Test custom fields on users", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create userType custom field", async () => {
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
	});

	it("Should create insuranceNumber custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: context.organization.id,
			entity: "User",
			title: "Insurance Number",
			name: "insuranceNumber",
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
	});

	it("Should create primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: context.account.id,
			firstName: "firstname",
			lastName: "lastname",
			birthday: "1986-04-01",
			gender: "male",
			status: "inactive",
			metadata: {
				userType: "doctor",
				insuranceNumber: "123",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.firstName, "firstname");
		assert.equal(body.lastName, "lastname");
		assert.isNotNaN(new Date(body.birthday).getTime());
		assert.isTrue(body.isPrimary);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		assert.isNull(body.imageUrl);
		context["userId"] = body.id;
	});

	it("Should create non-primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: context.account.id,
			firstName: "firstname2",
			lastName: "lastname2",
			birthday: "1986-04-01",
			gender: "female",
			status: "inactive",
			metadata: {
				userType: "patient",
				insuranceNumber: "321",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.firstName, "firstname2");
		assert.equal(body.lastName, "lastname2");
		assert.isNotNaN(new Date(body.birthday).getTime());
		assert.isFalse(body.isPrimary);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		assert.isNull(body.imageUrl);
		context["user2Id"] = body.id;
	});

	it("Should search users by custom fields", async () => {
		const { statusCode, body } = await server.get("/v1/users").query({
			orgId: context.organization.id,
			accountId: context.account.id,
			"metadata[insuranceNumber]": "321",
		});
	});

	after(async () => {
		await CustomField.destroy({
			where: {
				orgId: context.organization.id,
			},
			force: true
		});
	});
});
