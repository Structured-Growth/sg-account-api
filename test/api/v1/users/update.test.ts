import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { createCustomField } from "../../../common/create-custom-field";

describe("PUT /api/v1/users/:userId", () => {
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
		assert.equal(body.metadata.userType, "doctor");
		context.userId = body.id;
	});

	it("Should update user", async () => {
		const { statusCode, body } = await server.put(`/v1/users/${context.userId}`).send({
			firstName: "firstnamenew",
			lastName: "lastnamenew",
			birthday: "1986-04-04",
			gender: "female",
			isPrimary: true,
			status: "active",
			metadata: {
				userType: "nurse",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.userId);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.firstName, "firstnamenew");
		assert.equal(body.lastName, "lastnamenew");
		assert.equal(body.birthday, "1986-04-04");
		assert.equal(body.gender, "female");
		assert.equal(body.isPrimary, true);
		assert.equal(body.status, "active");
		assert.equal(body.metadata.userType, "nurse");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/users/${context.userId}`).send({
			firstName: 4,
			lastName: 1,
			birthday: "1986 April 1",
			gender: "unknown",
			isPrimary: 1,
			status: "deleted",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.firstName[0]);
		assert.isString(body.validation.body.lastName[0]);
		assert.isString(body.validation.body.birthday[0]);
		assert.isString(body.validation.body.gender[0]);
		assert.isString(body.validation.body.isPrimary[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/users/${context.userId}`).send({
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

	it("Should return validation error if user id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/users/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if user id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/users/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
