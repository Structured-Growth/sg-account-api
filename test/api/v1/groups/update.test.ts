import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { createCustomField } from "../../../common/create-custom-field";

describe("PUT /api/v1/groups/:groupId", () => {
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
		entity: "Group",
		name: "groupType",
		title: "Group Type",
	});

	it("Should create a group", async () => {
		const { statusCode, body } = await server.post("/v1/groups").send({
			accountId: context.account.id,
			title: `group-${context.account.id}`,
			status: "active",
			metadata: {
				groupType: "patients",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.metadata.groupType, "patients");
		context.groupId = body.id;
	});

	it("Should update group", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/${context.groupId}`).send({
			title: `group-${context.account.id}-2`,
			status: "inactive",
			metadata: {
				groupType: "staff",
			},
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isNull(body.parentGroupId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.title, `group-${context.account.id}-2`);
		assert.equal(body.name, `group-${context.account.id}-2`);
		assert.equal(body.status, "inactive");
		assert.equal(body.metadata.groupType, "staff");
		assert.isNull(body.imageUrl);
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/${context.groupId}`).send({
			parentGroupId: 0,
			title: 1,
			status: "deleted",
			imageBase64: false,
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.parentGroupId[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.imageBase64[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/${context.groupId}`).send({
			metadata: {
				groupType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.groupType[0]);
	});

	it("Should return validation error if group id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if group id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/groups/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
