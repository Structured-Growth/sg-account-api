import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { createOrganization } from "../../../common/create-organization";

describe("GET /api/v1/accounts", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: context.organization.id,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		context["accountId"] = body.id;
	});

	it("Should return 0 account", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			orgId: 999999,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return account", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			"id[0]": context.accountId,
			orgId: context.organization.id,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.accountId);
		assert.equal(body.data[0].orgId, context.organization.id);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.isString(body.data[0].status);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/accounts").query({
			id: -1,
			orgId: "a",
			page: 0,
			limit: false,
			sort: "createdAt:asc",
			"status[0]": "deleted",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.status[0][0]);
	});
});
