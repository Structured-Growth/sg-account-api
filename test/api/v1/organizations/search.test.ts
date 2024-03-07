import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Organization from "../../../../database/models/organization";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/organizations", () => {
	const { server, context } = initTest();
	const randomTitle = `TestParentOrgName-${Date.now()}`;

	it("Should create organisation", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["createdOrgId"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			id: "a",
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			parentOrgId: -1,
			"status[0]": "activated",
			"title[0]": 1,
			name: false,
			orgId: 6,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.parentOrgId[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.name[0]);
		assert.isString(body.validation.query.orgId[0]);
	});

	it("Should return organizations", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			"id[0]": context["createdOrgId"],
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context["createdOrgId"]);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "inactive");
		assert.isString(body.data[0].arn);
		assert.isNull(body.data[0].parentOrgId);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].title, randomTitle);
		assert.isString(body.data[0].name);
		assert.isNull(body.data[0].imageUrl);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should search by title", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			"id[0]": context["createdOrgId"],
			"title[0]": "Te*",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.total, 1);
		assert.equal(body.data[0].id, context["createdOrgId"]);
	});

	it("Should return error if parentOrgIs is invalid", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "64*",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.parentOrgId[0]);
	});

	it("Should return error if status is invalid", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			parentOrgId: "18",
			"status[0]": "deleted",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isNotEmpty(body.validation.query.status[0]);
	});

	it("Should return error if one status is invalid", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			"status[0]": "deleted",
			"status[1]": "active",
		});
		assert.equal(statusCode, 422);
		assert.isNotEmpty(body.validation.query.status[0]);
	});

	it("Should return organisation", async () => {
		const { statusCode, body } = await server.get("/v1/organizations").query({
			"status[0]": "inactive",
			"status[1]": "active",
		});
		assert.equal(statusCode, 200);
	});
});
