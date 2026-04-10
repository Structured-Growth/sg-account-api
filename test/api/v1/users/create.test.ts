import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/users", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	createCustomField(server, context, {
		orgId: (context) => context.organization.id,
		entity: "User",
		name: "userType",
		title: "User Type",
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
		assert.equal(body.metadata.userType, "doctor");
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
		assert.equal(body.metadata.userType, "patient");
		assert.isString(body.arn);
		assert.isNull(body.imageUrl);
		context["user2Id"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: "myaccount",
			firstName: "JonathanAlexanderMaximilianChristopherBenjaminLongname",
			lastName: "MontgomeryWilliamsonFitzgeraldAndersonTheThirdLongname",
			birthday: "1 april 2054",
			gender: "males",
			status: "superuser",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.firstName[0]);
		assert.isString(body.validation.body.lastName[0]);
		assert.isString(body.validation.body.birthday[0]);
		assert.isString(body.validation.body.gender[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: context.account.id,
			firstName: "invalid",
			lastName: "metadata",
			metadata: {
				userType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.userType[0]);
	});
});
