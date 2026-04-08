import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as slug from "slug";
import { createCustomField } from "../../../common/create-custom-field";

describe("PUT /api/v1/organizations/:organizationId", () => {
	const { server, context } = initTest();
	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomNewTitle = `TestOrgName-${Date.now()}`;
	const initialOrgType = "clinic";

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
			name: slug(randomTitle),
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "active");
		context.createdOrgId = body.id;
	});

	createCustomField(server, context, {
		orgId: (context) => context.createdOrgId,
		entity: "Organization",
		name: "orgType",
		title: "Org Type",
	});

	it("Should create child organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: `${randomTitle}-child`,
			name: slug(`${randomTitle}-child`),
			status: "active",
			metadata: {
				orgType: initialOrgType,
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.metadata.orgType, initialOrgType);
		context.childOrgId = body.id;
	});

	it("Should update organisation", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.childOrgId}`).send({
			title: randomNewTitle,
			status: "archived",
			metadata: {
				orgType: "hospital",
			},
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.isString(body.arn);
		assert.isDefined(body.parentOrgId);
		assert.equal(body.region, "us");
		assert.equal(body.title, randomNewTitle);
		assert.equal(body.metadata.orgType, "hospital");
		assert.isString(body.name);
		assert.isNull(body.imageUrl);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.childOrgId}`).send({
			title: "test3",
			status: "deleted",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should not return validation error if name was not changed", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.childOrgId}`).send({
			title: randomNewTitle,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.childOrgId}`).send({
			metadata: {
				orgType: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.orgType[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/9999`).send({
			status: "archived",
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
