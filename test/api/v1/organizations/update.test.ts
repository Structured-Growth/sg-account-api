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
			title: "Mytestorgfor2",
			status: "active"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "active");
		assert.isNull(body.imageUrl);
		params['createdOrgId'] = body.id;
	});

	it("Should update organisation", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: "Mytestorgfornew",
			status: "archived"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.isString(body.arn);
		assert.equal(body.parentOrgId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Mytestorgfornew");
		assert.equal(body.name, "mytestorgfornew");
		assert.isNull(body.imageUrl);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: "test3",
			status: "deleted"
		});
		assert.equal(statusCode, 422);
	});
	it("Should return validation error if name already exists", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: "test"
		});
		assert.equal(statusCode, 422);
	});

	it("Should return validation error if id s wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/9999`).send({
			title: "test3",
			status: "deleted"
		});
		assert.equal(statusCode, 422);
	});

});
