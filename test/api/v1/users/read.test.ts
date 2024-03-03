import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/users", () => {
	const server = agent(webServer(routes));
	const params: Record<any, any> = {};

	before(async () => container.resolve<App>("App").ready);

	const generateRandomTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmyusernew${randomSuffix}`;
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
			status: "active"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		params['accountId'] = body.id;
	});

	it("Should create primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: params.accountId,
			firstName: "firstname",
			lastName: "lastname",
			birthday: "1986-04-01",
			gender: "male",
			status: "inactive"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		params['userId'] = body.id;
	});

	it("Should read user", async () => {
		const { statusCode, body } = await server.get(`/v1/users/${params.userId}`).send({

		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, params.userId);
		assert.equal(body.orgId, params.createdOrgId);
		assert.equal(body.accountId, params.accountId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.firstName, 'firstname');
		assert.equal(body.lastName, 'lastname');
		assert.equal(body.birthday, '1986-04-01T00:00:00.000Z');
		assert.equal(body.gender, 'male');
		assert.equal(body.isPrimary, true);
		assert.equal(body.status, 'inactive');
		assert.isString(body.arn);
	});

	it("Should return is account does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/users/999999`).send({
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);

	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/users/mainaccount`).send({
		});
		assert.equal(statusCode, 500);
		assert.isString(body.message);
	});

});
