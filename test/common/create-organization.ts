import { assert } from "chai";
import { random, set } from "lodash";
import * as slug from "slug";

export function createOrganization(
	server,
	context: Record<any, any>,
	options: {
		contextPath: string;
	} = {
		contextPath: "organization",
	}
) {
	const randomTitle = `Org-${Date.now()}-${random(100, 999)}`;

	it("Should create organization", async () => {
		const { statusCode, body } = await server.post("/v1/organizations").send({
			region: "us",
			title: randomTitle,
			name: slug(randomTitle),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		set(context, options.contextPath, body);
	});
}
