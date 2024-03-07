import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("GET /api/v1/users/:userId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create primary user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: context.account.id,
			firstName: "firstname",
			lastName: "lastname",
			birthday: "1986-04-01",
			gender: "male",
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context.userId = body.id;
	});

	it("Should read user", async () => {
		const { statusCode, body } = await server.get(`/v1/users/${context.userId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.userId);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.firstName, "firstname");
		assert.equal(body.lastName, "lastname");
		assert.equal(body.birthday, "1986-04-01T00:00:00.000Z");
		assert.equal(body.gender, "male");
		assert.equal(body.isPrimary, true);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});

	it("Should return is account does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/users/999999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/users/wrong`).send({});
		assert.equal(statusCode, 500);
		assert.isString(body.message);
	});
});
