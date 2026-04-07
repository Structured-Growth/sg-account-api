import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as slug from "slug";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/organizations", () => {
	const { server, context } = initTest();

	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomParentTitle = `TestOrgName-${Date.now()}`;

	it("Should create parent organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
			name: slug(randomParentTitle),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["createdOrgId"] = body.id;
	});

	createCustomField(server, context, {
		orgId: (context) => context.createdOrgId,
		entity: "Organization",
		name: "orgType",
		title: "Org Type",
	});

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: randomTitle,
			name: slug(randomTitle),
			status: "active",
			metadata: {
				orgType: "clinic",
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.equal(body.parentOrgId, context.createdOrgId);
		assert.equal(body.region, "us");
		assert.equal(body.title, randomTitle);
		assert.equal(body.metadata.orgType, "clinic");
		assert.isString(body.name);
		assert.isNull(body.imageUrl);
	});

	it("Should return validation error organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: "main",
			region: "APAC",
			title: 321,
			name: "123",
			status: "enabled",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.parentOrgId[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return error if name already exists", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
			name: slug(randomParentTitle),
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: `${randomTitle}-invalid`,
			name: slug(`${randomTitle}-invalid`),
			status: "active",
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
});
