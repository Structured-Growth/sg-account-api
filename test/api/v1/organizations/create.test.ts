import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/organizations", () => {
	const server = agent(webServer(routes));
	const params: Record<any, any> = {};

	before(async () => container.resolve<App>("App").ready);

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: 1,
			region: "us",
			title: "Mytestorg",
			status: "active"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.equal(body.parentOrgId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Mytestorg");
		assert.equal(body.name, "mytestorg");
		assert.isNull(body.imageUrl);
		params['createdOrgId'] = body.id;
	});

	it("Should return validation error organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: "main",
			region: "APAC",
			title: 321,
			status: "enabled"
		});
		assert.equal(statusCode, 422);
	});

	it("Should return error if name already exists", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: "Mytestorg"
		});
		assert.equal(statusCode, 422);
	});

});
