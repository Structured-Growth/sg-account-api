import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as slug from "slug";

describe("GET /api/v1/organizations/:organizationId", () => {
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
		context.createdOrgId = body.id;
	});

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: randomTitle,
			name: slug(randomTitle),
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["createdChildOrgId"] = body.id;
	});

	it("Should read organisation", async () => {
		const { statusCode, body } = await server.get(`/v1/organizations/${context.createdChildOrgId}`).send({
			organizationId: context["createdChildOrgId"],
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context["createdChildOrgId"]);
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

	it("Should return error if organisation does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/organizations/99999999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return error if id is wrong", async () => {
		const { statusCode, body } = await server.get("/v1/organizations/main").send({
			organizationId: "main",
		});
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
