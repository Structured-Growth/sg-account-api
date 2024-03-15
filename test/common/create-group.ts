import { assert } from "chai";
import { isFunction, set } from "lodash";

export function createGroup(
	server,
	context: Record<any, any>,
	options: {
		accountId: ((context: Record<any, any>) => number) | number;
		contextPath: string;
	}
) {
	it("Should create group", async () => {
		const { statusCode, body } = await server.post("/v1/groups").send({
			accountId: isFunction(options.accountId) ? options.accountId(context) : options.accountId,
			title: `group-${context.account.id}`,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}
