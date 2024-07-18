import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/users", () => {
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
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.firstName, "firstname");
		assert.equal(body.lastName, "lastname");
		assert.isString(body.birthday);
		assert.isBoolean(body.isPrimary);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
		context.userId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/users").query({
			orgId: "a",
			accountId: 0,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			firstName: "-",
			lastName: "<",
			birthday: "april",
			gender: 1,
			isPrimary: "yes",
			"status[0]": "superuser",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.birthday[0]);
		assert.isString(body.validation.query.gender[0]);
		assert.isString(body.validation.query.isPrimary[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.firstName[0][0]);
		assert.isString(body.validation.query.lastName[0][0]);
	});

	it("Should return user", async () => {
		const { statusCode, body } = await server.get("/v1/users").query({
			"id[0]": context.userId,
			orgId: context.organization.id,
			"accountId[0]": context.account.id,
			"firstName[0]": "firstname",
			"lastName[0]": "lastname",
			"birthday[0]": "1986-04-01",
			"birthday[1]": "1986-04-01",
			"gender[0]": "male",
			isPrimary: true,
			"status[0]": "inactive",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.userId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.equal(body.data[0].accountId, context.account.id);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].firstName, "firstname");
		assert.equal(body.data[0].lastName, "lastname");
		assert.equal(body.data[0].birthday, "1986-04-01T00:00:00.000Z");
		assert.equal(body.data[0].gender, "male");
		assert.equal(body.data[0].isPrimary, true);
		assert.equal(body.data[0].status, "inactive");
		assert.isString(body.data[0].arn);
		assert.isNull(body.data[0].imageUrl);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});
});
