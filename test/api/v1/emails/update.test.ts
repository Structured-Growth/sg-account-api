import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { createUser } from "../../../common/create-user";
import { createCustomField } from "../../../common/create-custom-field";

describe("PUT /api/v1/emails/:emailId", () => {
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

	createCustomField(server, context, {
		orgId: (context) => context.organization.id,
		entity: "Email",
		name: "emailType",
		title: "Email Type",
	});

	it("Should create primary email", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "test@example.com",
			metadata: {
				emailType: "work",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.metadata.emailType, "work");
		context.emailId = body.id;
	});

	it("Should update email", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/${context.emailId}`).send({
			status: "active",
			metadata: {
				emailType: "personal",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.emailId);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.email, "test@example.com");
		assert.equal(body.isPrimary, true);
		assert.equal(body.status, "active");
		assert.equal(body.metadata.emailType, "personal");
		assert.isString(body.arn);
		assert.isUndefined(body.verificationCodeHash);
		assert.isUndefined(body.verificationCodeSalt);
		assert.isUndefined(body.verificationCodeExpires);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/${context.emailId}`).send({
			isPrimary: 1,
			status: "deleted",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.isPrimary[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/${context.emailId}`).send({
			metadata: {
				emailType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.emailType[0]);
	});

	it("Should return error if it's the last primary email in account", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/${context.emailId}`).send({
			isPrimary: false,
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return validation error if email id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if email id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/emails/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
