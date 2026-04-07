import { assert } from "chai";
import { isFunction, set } from "lodash";

export function createCustomField(
	server,
	context: Record<any, any>,
	options: {
		orgId: ((context: Record<any, any>) => number) | number;
		entity: string;
		name: string;
		title?: string;
		contextPath?: string;
	}
) {
	it(`Should create ${options.entity} custom field ${options.name}`, async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId: isFunction(options.orgId) ? options.orgId(context) : options.orgId,
			entity: options.entity,
			title: options.title || options.name,
			name: options.name,
			schema: {
				type: "string",
				flags: { presence: "required" },
			},
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);

		if (options.contextPath) {
			set(context, options.contextPath, body);
		}
	});
}
