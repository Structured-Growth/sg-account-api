import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/organizations", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			orgId: 1,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
	});

	it("Should return organizations", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({});
		assert.equal(statusCode, 200);
		assert.equal(body.data.length, 4);
		assert.equal(body.data[0].id, 1);
		assert.equal(body.data[0].parentOrgId, null);
		assert.isString(body.data[0].region);
		assert.isString(body.data[0].title);
		assert.isString(body.data[0].name);
		assert.equal(body.data[0].status, "active");
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNull(body.data[0].updatedAt);
		assert.isString(body.data[0].imageUrl);
		assert.isString(body.data[0].arn);
		assert.equal(body.total, 4);
		assert.equal(body.limit, 20);
		assert.equal(body.page, 1);
	});
});
