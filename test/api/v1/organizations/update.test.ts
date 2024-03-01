import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/organizations", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should update organisation", async () => {
		const { statusCode, body } = await server.put("/v1/organizations").send({
			title: "test",
			status: "active"
		});
		assert.equal(statusCode, 201);
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
		const { statusCode, body } = await server.put("/v1/organizations").send({
			title: "test3",
			status: "deleted"
		});
		assert.equal(statusCode, 422);
		assert.equal(body.data[0].id, 1);
		assert.equal(body.data[0].title, "test3");
		assert.equal(body.data[0].name, "test3");
		assert.equal(body.data[0].status, "inactive");
		assert.isNotEmpty(body.data[0].region,);
		assert.isNotEmpty(body.data[0].createdAt,);
		assert.isNotEmpty(body.data[0].updatedAt,);
		assert.equal(body.data[0].imageUrl, null);
		assert.isNotEmpty(body.data[0].arn);
	});

});
