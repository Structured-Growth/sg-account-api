import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/organizations/:organizationId", () => {
	const { server, context } = initTest();
	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomNewTitle = `TestOrgName-${Date.now()}`;

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "active");
		context.createdOrgId = body.id;
	});

	it("Should update organisation", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.createdOrgId}`).send({
			title: randomNewTitle,
			status: "archived",
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
		const { statusCode, body } = await server.put(`/v1/organizations/${context.createdOrgId}`).send({
			title: "test3",
			status: "deleted",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if name already exists", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/${context.createdOrgId}`).send({
			title: randomNewTitle,
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.title[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/organizations/9999`).send({
			status: "archived",
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
