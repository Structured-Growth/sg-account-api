import { assert } from "chai";
import { isFunction, set } from "lodash";

export function createUser(
	server,
	context: Record<any, any>,
	options: {
		accountId: ((context: Record<any, any>) => number) | number;
		contextPath: string;
	}
) {
	it("Should create user", async () => {
		const { statusCode, body } = await server.post("/v1/users").send({
			accountId: isFunction(options.accountId) ? options.accountId(context) : options.accountId,
			firstName: "Test",
			lastName: "User",
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}
