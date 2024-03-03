import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("POST /api/v1/users", () => {
	const server = agent(webServer(routes));
	const params: Record<any, any> = {};

	before(async () => container.resolve<App>("App").ready);

	const generateRandomTitle = () => {
		const randomSuffix = Math.floor(Math.random() * 1000);
		return `Testmyuser${randomSuffix}`;
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
		assert.equal(body.orgId, params.createdOrgId);
		assert.equal(body.accountId, params.accountId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.firstName, "firstname");
		assert.equal(body.lastName, "lastname");
		assert.isString(body.birthday);
		assert.isBoolean(body.isPrimary);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		assert.isNull(body.imageUrl);
		params['userId'] = body.id;
	});

	it("Should create non-primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: params.accountId,
			firstName: "firstname2",
			lastName: "lastname2",
			birthday: "1986-04-01",
			gender: "female",
			status: "inactive"
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, params.createdOrgId);
		assert.equal(body.accountId, params.accountId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.firstName, "firstname2");
		assert.equal(body.lastName, "lastname2");
		assert.isString(body.birthday);
		assert.isBoolean(body.isPrimary);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		assert.isNull(body.imageUrl);
		params['user2Id'] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: "myaccount",
			firstName: "o",
			lastName: 7,
			birthday: "1 april 2054",
			gender: "males",
			status: "superuser"
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.firstName[0]);
		assert.isString(body.validation.body.lastName[0]);
		assert.isString(body.validation.body.birthday[0]);
		assert.isString(body.validation.body.status[0]);
		params['userId'] = body.id;
	});


});
