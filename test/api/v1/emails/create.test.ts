import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/emails", () => {
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
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.email, "test@example.com");
		assert.isTrue(body.isPrimary);
		assert.equal(body.status, "verification");
		assert.equal(body.metadata.emailType, "work");
		assert.isString(body.arn);
		context.emailId = body.id;
	});

	it("Should return error if email is already exists", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "test@example.com",
		});
		assert.equal(statusCode, 422);
		assert.isString(body.validation.email[0]);
	});

	it("Should create non-primary email", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "test2@example.com",
			metadata: {
				emailType: "personal",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.email, "test2@example.com");
		assert.isFalse(body.isPrimary);
		assert.equal(body.status, "verification");
		assert.equal(body.metadata.emailType, "personal");
		assert.isString(body.arn);
		context.emailId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: -1,
			userId: -1,
			email: "example.com",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.email[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "custom-field-invalid@example.com",
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
});
