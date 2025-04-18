import { assert } from "chai";
import { isFunction, random, set } from "lodash";
import * as slug from "slug";

export function createOrganization(
	server,
	context: Record<any, any>,
	options: {
		contextPath: string;
		parentOrgId?: ((context: Record<any, any>) => number) | number;
	} = {
		contextPath: "organization",
	}
) {
	const randomTitle = `Org-${Date.now()}-${random(100, 999)}`;

	it("Should create organization", async function () {
		this.timeout(10000);
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			parentOrgId: isFunction(options.parentOrgId) ? options.parentOrgId(context) : options.parentOrgId,
			title: randomTitle,
			name: slug(randomTitle),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}
