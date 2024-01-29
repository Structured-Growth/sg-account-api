import "../src/app/providers";
import { assert } from "chai";
import { App } from "../src/app/app";
import { container } from "@structured-growth/microservice-sdk";
import { ResolverController } from "../src/controllers/v1";

describe("Test resolver", () => {
	const controller = new ResolverController();
	const app = container.resolve<App>("App");

	before(async () => app.ready);

	it("Should return resolved model", async () => {
		const { arn } = await controller.resolve({
			resource: "Example",
			id: 1,
		});
		assert.isString(arn);
	});

	it("Should return list of actions", async () => {
		const { data } = await controller.actions();
		assert.isArray(data);
		assert.equal(data.filter((item) => item.action.includes("resolve")).length, 3);
	});

	it("Should return list of models", async () => {
		const { data } = await controller.models();
		assert.equal(data[0].resource, "Example");
	});
});
