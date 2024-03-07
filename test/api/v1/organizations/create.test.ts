import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/organizations", () => {
	const { server, context } = initTest();

	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomParentTitle = `TestOrgName-${Date.now()}`;

	it("Should create parent organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["createdOrgId"] = body.id;
	});

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: randomTitle,
			status: "active",
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
		assert.isString(body.name);
		assert.isNull(body.imageUrl);
	});

	it("Should return validation error organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: "main",
			region: "APAC",
			title: 321,
			status: "enabled",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.parentOrgId[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.title[0]);
	});

	it("Should return error if name already exists", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.title[0]);
	});
});
