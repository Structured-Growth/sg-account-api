import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("GET /api/v1/emails", () => {
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
		context.emailId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/emails").query({
			orgId: "a",
			accountId: 0,
			userId: 0,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			email: false,
			isPrimary: "yes",
			"status[0]": "invalid",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.userId[0]);
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.page[0]);
		assert.isString(body.validation.query.limit[0]);
		assert.isString(body.validation.query.sort[0]);
		assert.isString(body.validation.query.email[0][0]);
		assert.isString(body.validation.query.isPrimary[0]);
		assert.isString(body.validation.query.status[0][0]);
	});

	it("Should return email", async () => {
		const { statusCode, body } = await server.get("/v1/emails").query({
			"id[0]": context.emailId,
			orgId: context.organization.id,
			"accountId[0]": context.account.id,
			isPrimary: true,
			"status[0]": "verification",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.emailId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].email, "test@example.com");
		assert.equal(body.data[0].isPrimary, true);
		assert.equal(body.data[0].status, "verification");
		assert.isString(body.data[0].arn);
		assert.isUndefined(body.data[0].verificationCodeHash);
		assert.isUndefined(body.data[0].verificationCodeSalt);
		assert.isUndefined(body.data[0].verificationCodeExpires);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});
});
