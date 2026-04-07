import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";
import { createCustomField } from "../../../common/create-custom-field";

describe("GET /api/v1/phones", () => {
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
		entity: "Phone",
		name: "phoneType",
		title: "Phone Type",
	});

	it("Should create primary phone", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112233",
			metadata: {
				phoneType: "mobile",
			},
		});
		assert.equal(statusCode, 201);
		context.phoneId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/phones").query({
			orgId: "a",
			accountId: 0,
			userId: 0,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			phoneNumber: false,
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
		assert.isString(body.validation.query.phoneNumber[0][0]);
		assert.isString(body.validation.query.isPrimary[0]);
		assert.isString(body.validation.query.status[0][0]);
	});

	it("Should return phone", async () => {
		const { statusCode, body } = await server.get("/v1/phones").query({
			"id[0]": context.phoneId,
			orgId: context.organization.id,
			"accountId[0]": context.account.id,
			isPrimary: true,
			"status[0]": "verification",
			metadata: {
				phoneType: "mobile",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.phoneId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].phoneNumber, "+15551112233");
		assert.equal(body.data[0].isPrimary, true);
		assert.equal(body.data[0].status, "verification");
		assert.isString(body.data[0].arn);
		assert.isUndefined(body.data[0].verificationCodeHash);
		assert.isUndefined(body.data[0].verificationCodeSalt);
		assert.isUndefined(body.data[0].verificationCodeExpires);
		assert.equal(body.data[0].metadata.phoneType, "mobile");
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should search by phone number", async () => {
		const { statusCode, body } = await server.get("/v1/phones").query({
			orgId: context.organization.id,
			"accountId[0]": context.account.id,
			"phoneNumber[]": "*5551112233",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.phoneId);
	});

	it("Should search by metadata wildcard", async () => {
		const { statusCode, body } = await server.get("/v1/phones").query({
			orgId: context.organization.id,
			metadata: {
				phoneType: "mob*",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.total, 1);
		assert.equal(body.data[0].id, context.phoneId);
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.get("/v1/phones").query({
			orgId: context.organization.id,
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.metadata[0]);
	});
});
