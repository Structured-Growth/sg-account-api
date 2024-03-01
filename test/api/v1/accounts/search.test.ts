import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/accounts", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: 1,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		assert.isUndefined(body.password)
	});

	it("Should return 0 account", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			orgId: 6,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].name, "ValidationError");
		assert.isNumber(body.data[0].id);
		assert.isNumber(body.data[0].orgId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.isUndefined(body.data[0].password)
	});

	it("Should return organizations", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			orgId: 1,
		});
		assert.equal(statusCode, 200);
		assert.isNumber(body.data[0].id);
		assert.isNumber(body.data[0].orgId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.isUndefined(body.data[0].password)
	});

	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			orgId: 0,
		});
		assert.isNumber(body.data[0].id);
		assert.isNumber(body.data[0].orgId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.isUndefined(body.data[0].password)
	});


	it("Should return error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			orgId: "64*",
		});
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.isUndefined(body.password)
	});

});
