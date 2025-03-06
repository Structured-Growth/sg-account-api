import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("POST /api/v1/emails/:emailId/verify", () => {
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

	it("Should create primary email", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			accountId: context.account.id,
			userId: context.user.id,
			email: "test@example.com",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.status, "verification");
		context.emailId = body.id;
	});

	it("Should generate and send verification code", async () => {
		const { statusCode, body } = await server.post(`/v1/emails/${context.emailId}/send-code`);
		assert.equal(statusCode, 204);
	});

	// it("Should verify email by code", async () => {
	// 	const { statusCode, body } = await server.post(`/v1/emails/${context.emailId}/verify`).send({
	// 		verificationCode: "123456",
	// 	});
	// 	assert.equal(statusCode, 200);
	// 	assert.equal(body.id, context.emailId);
	// 	assert.equal(body.orgId, context.organization.id);
	// 	assert.equal(body.accountId, context.account.id);
	// 	assert.equal(body.userId, context.user.id);
	// 	assert.isString(body.createdAt);
	// 	assert.isString(body.updatedAt);
	// 	assert.equal(body.email, "test@example.com");
	// 	assert.equal(body.isPrimary, true);
	// 	assert.equal(body.status, "active");
	// 	assert.isString(body.arn);
	// 	assert.isUndefined(body.verificationCodeHash);
	// 	assert.isUndefined(body.verificationCodeSalt);
	// 	assert.isUndefined(body.verificationCodeExpires);
	// });
	//
	// it("Should have active status", async () => {
	// 	const { statusCode, body } = await server.get(`/v1/emails/${context.emailId}`);
	// 	assert.equal(statusCode, 200);
	// 	assert.equal(body.id, context.emailId);
	// 	assert.equal(body.status, "active");
	// });
});
