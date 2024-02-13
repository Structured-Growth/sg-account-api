import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("POST /api/v1/emails", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should create email", async () => {
		const { statusCode, body } = await server.post("/v1/emails").send({
			orgId: 1,
			accountId: 1,
			userId: 1,
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.isNumber(body.orgId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.isString(body.status);
		assert.isString(body.arn);
	});
});
