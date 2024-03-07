import { assert } from "chai";
import { isFunction, random, result, set } from "lodash";

export function createAccount(
	server,
	context: Record<any, any>,
	options: {
		orgId: ((context: Record<any, any>) => number) | number;
		contextPath: string;
	}
) {
	it("Should create account", async () => {
		const { statusCode, body } = await server.post("/v1/accounts").send({
			orgId: isFunction(options.orgId) ? options.orgId(context) : options.orgId,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}
