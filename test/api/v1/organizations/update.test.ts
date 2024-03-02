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

	const generateRandomTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmy${randomSuffix}`;
	};
	const randomTitle = generateRandomTitle();

	const generateRandomNewTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmy${randomSuffix}`;
	};
	const randomNewTitle = generateRandomNewTitle();


	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
			status: "active"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "active");
		params['createdOrgId'] = body.id;
	});

	it("Should update organisation", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: randomNewTitle,
			status: "archived"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.isString(body.arn);
		assert.isDefined(body.parentOrgId);
		assert.equal(body.region, "us");
		assert.equal(body.title, randomNewTitle);
		assert.isString(body.name);
		assert.isNull(body.imageUrl);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: "test3",
			status: "deleted"
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
	it("Should return validation error if name already exists", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${params.createdOrgId}`).send({
			title: randomNewTitle
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/9999`).send({
			status: "archived"
		});
		assert.equal(statusCode, 404);
	});

});
