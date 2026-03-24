import { assert } from "chai";
import "../src/app/providers";
import { initTest } from "./common/init-test";

describe("Test resolver", () => {
	const { server } = initTest();

	it("Should return resolved model", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/resolve").query({
			resource: "Unknown",
			id: 1,
		});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
	});

	it("Should return list of actions", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/actions");
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.equal(body.data.filter((item) => item.action.includes("resolve")).length, 4);
	});

	it("Should return list of models", async () => {
		const { statusCode, body } = await server.get("/v1/resolver/models");
		assert.equal(statusCode, 200);
		assert.isString(body.data[0].resource);
	});

	it("Should validate custom fields payload", async () => {
		const { statusCode, body } = await server.post("/v1/resolver/validate").send({
			entity: "User",
			data: {},
		});
		assert.equal(statusCode, 200);
		assert.deepEqual(body, {
			valid: true,
		});
	});
});
