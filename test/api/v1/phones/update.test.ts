import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { createUser } from "../../../common/create-user";

describe("PUT /api/v1/phones/:phoneId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	createUser(server, context, {
		accountId: (context) => context.account.id,
		contextPath: "user",
	});

	it("Should create primary phone", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112233",
		});
		assert.equal(statusCode, 201);
		context.phoneId = body.id;
	});

	it("Should update phone", async () => {
		const { statusCode, body } = await server.put(`/v1/phones/${context.phoneId}`).send({
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.phoneId);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.phoneNumber, "+15551112233");
		assert.equal(body.isPrimary, true);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.isUndefined(body.verificationCodeHash);
		assert.isUndefined(body.verificationCodeSalt);
		assert.isUndefined(body.verificationCodeExpires);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/phones/${context.phoneId}`).send({
			isPrimary: 1,
			status: "deleted",
			phoneNumber: "+15551112244", // is not allowed
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.isPrimary[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.phoneNumber[0]);
	});

	it("Should return error if it's the last primary phone in account", async () => {
		const { statusCode, body } = await server.put(`/v1/phones/${context.phoneId}`).send({
			isPrimary: false,
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return validation error if phone id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/phones/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if phone id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/phones/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
