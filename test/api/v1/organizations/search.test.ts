import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/organizations", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			orgId: 2,
			region: "us",
			title: "test2"
		});
		assert.equal(statusCode, 201);
		assert.equal(body.id, 1);
		assert.equal(body.title, "test");
		assert.equal(body.accountId, 2);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			orgId: 6,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
	});

	it("Should return organizations", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: 1,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, 5);
		assert.equal(body.data[0].title, "test");
		assert.equal(body.data[0].name, "test");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});
	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: 1,
			'title[0]': "main*"
		});
		assert.equal(statusCode, 422);
		assert.equal(body.data[0].id, 1);
		assert.equal(body.data[0].title, "test");
		assert.equal(body.data[0].name, "test");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: 0,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.data[0].id, 5);
		assert.equal(body.data[0].title, "test");
		assert.equal(body.data[0].name, "test");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "main",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.data[0].id, 5);
		assert.equal(body.data[0].title, "test");
		assert.equal(body.data[0].name, "test");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "64*",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.data[0].id, 5);
		assert.equal(body.data[0].title, "test");
		assert.equal(body.data[0].name, "test");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "18",
			'status[0]': "deleted"
		});
		assert.equal(statusCode, 422);
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "16",
			'status[0]': "deleted",
			'status[1]': "active"
		});
		assert.equal(statusCode, 422);
	});

	it("Should return organisation", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "17",
			'status[0]': "inactive",
			'status[1]': "active"
		});
		assert.equal(statusCode, 200);
	});
});
