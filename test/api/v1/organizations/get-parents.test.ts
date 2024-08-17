import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as slug from "slug";

describe("GET /api/v1/organizations/:organizationId/parents", () => {
	const { server, context } = initTest();
	const randomTitle = `TestParentOrgName-${Date.now()}`;
	const randomParentTitle = `TestOrgName-${Date.now()}`;

	it("Should create parent organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomParentTitle,
			name: slug(randomParentTitle),
			status: "active",
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

	it("Should get parent organizations", async () => {
		const { statusCode, body } = await server.get(`/v1/organizations/${context.createdChildOrgId}/parents`).send({
			organizationId: context["createdChildOrgId"],
		});
		assert.equal(statusCode, 200);
		assert.equal(body[0].id, context["createdOrgId"]);
		assert.isString(body[0].createdAt);
		assert.isString(body[0].updatedAt);
		assert.equal(body[0].status, "active");
		assert.isString(body[0].arn);
		assert.equal(body[0].parentOrgId, null);
		assert.equal(body[0].region, "us");
		assert.equal(body[0].title, randomParentTitle);
		assert.isString(body[0].name);
		assert.isNull(body[0].imageUrl);
	});
});
