import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as slug from "slug";

describe("DELETE /api/v1/organizations/:organizationId", () => {
	const { server, context } = initTest();
	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomParentTitle = `TestOrgName-${Date.now()}`;

	it("Should create parent organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
			name: slug(randomParentTitle),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context.createdOrgId = body.id;
	});

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			parentOrgId: context.createdOrgId,
			region: "us",
			title: randomTitle,
			name: slug(randomTitle),
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["createdChildOrgId"] = body.id;
	});

	it("Should delete organisation", async () => {
		const { statusCode, body } = await server.delete(`/v1/organizations/${context.createdChildOrgId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return error if organisation does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/organizations/${context.createdChildOrgId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete("/v1/organizations/main");
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
