import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Organization from "../../../../database/models/organization";

describe("GET /api/v1/organizations", () => {
	const server = agent(webServer(routes));
	const params: Record<any, any> = {};

	before(async () => {


		await container.resolve<App>("App").ready;
		//await Organization.truncate();
	});

	const generateRandomTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmy${randomSuffix}`;
	};
	const randomTitle = generateRandomTitle();

	const generateRandomParentTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmy${randomSuffix}`;
	};
	const randomParentTitle = generateRandomParentTitle();


	it("Should create parent organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		params['createdOrgId'] = body.id;
	});

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: params.createdOrgId,
			region: "us",
			title: randomTitle,
			status: "active"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
		assert.equal(body.parentOrgId, params.createdOrgId);
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
			status: "enabled"
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return error if name already exists", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle
		});
		assert.equal(statusCode, 422);
	});

});
