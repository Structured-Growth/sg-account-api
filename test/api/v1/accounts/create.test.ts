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
			orgId: 1
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

	it("Should return error", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			id: "1",
			orgId: 1
		});
		assert.equal(statusCode, 422);
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.isUndefined(body.password)
	});

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: 1,
			status: "inactive"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});

});
