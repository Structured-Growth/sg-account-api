import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("DELETE /api/v1/accounts", () => {
	const server = agent(webServer(routes));
	const params: Record<any, any> = {};

	before(async () => container.resolve<App>("App").ready);

	const generateRandomTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmy${randomSuffix}`;
	};
	const randomTitle = generateRandomTitle();

	it("Should create organisation", async () => {

		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		params['createdOrgId'] = body.id;
	});

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: params.createdOrgId,
			status: "inactive"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, params['createdOrgId']);
		assert.equal(body.status, "inactive");
		params['accountId'] = body.id;
	});


	it("Should delete organisation", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/${params.accountId}`).send({
		});
		assert.equal(statusCode, 204);
	});

	it("Should return is account does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/${params.accountId}`).send({

		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);

	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/accounts/mainaccount`).send({
		});
		assert.equal(statusCode, 500);
		assert.isString(body.message);
	});


});
