import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("PUT /api/v1/users", () => {
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

	it("Should update user", async () => {
		const { statusCode, body } = await server.put(`/v1/users/${params.userId}`).send({
			firstName: 'firstnamenew',
			lastName: 'lastnamenew',
			birthday: '1986-04-04',
			gender: 'female',
			isPrimary: false,
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, params.userId);
		assert.equal(body.orgId, params.createdOrgId);
		assert.equal(body.accountId, params.accountId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.firstName, 'firstnamenew');
		assert.equal(body.lastName, 'lastnamenew');
		assert.equal(body.birthday, '1986-04-04');
		assert.equal(body.gender, 'female');
		assert.equal(body.isPrimary, false);
		assert.equal(body.status, 'active');
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/accounts/${params.userId}`).send({
			firstName: 4,
			lastName: 1,
			birthday: '1986 April 1',
			gender: 'unknown',
			isPrimary: 1,
			status: "deleted",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.firstName[0]);
		assert.isString(body.validation.body.lastName[0]);
		assert.isString(body.validation.body.birthday[0]);
		assert.isString(body.validation.body.gender[0]);
		assert.isString(body.validation.body.isPrimary[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if user id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/users/9999`).send({
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});


});
