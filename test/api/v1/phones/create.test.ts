import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/phones", () => {
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
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.phoneNumber, "+15551112233");
		assert.isTrue(body.isPrimary);
		assert.equal(body.status, "verification");
		assert.equal(body.metadata.phoneType, "mobile");
		assert.isString(body.arn);
		context.phoneId = body.id;
	});

	it("Should return error if phone is already exists", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112233",
		});
		assert.equal(statusCode, 422);
		assert.isString(body.validation.phoneNumber[0]);
	});

	it("Should create non-primary phone", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112244",
			metadata: {
				phoneType: "home",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.equal(body.userId, context.user.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.phoneNumber, "+15551112244");
		assert.isFalse(body.isPrimary);
		assert.equal(body.status, "verification");
		assert.equal(body.metadata.phoneType, "home");
		assert.isString(body.arn);
		context.phoneId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: -1,
			userId: -1,
			phoneNumber: "15551112233",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.phoneNumber[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112255",
			metadata: {
				phoneType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.phoneType[0]);
	});
});
