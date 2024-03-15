import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/preferences/:accountId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should read preferences", async () => {
		const { statusCode, body } = await server.get(`/v1/preferences/${context.account.id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.units, "metric");
		assert.equal(body.language, "en");
		assert.equal(body.locale, "US");
		assert.equal(body.timezone, "CST");
	});
});
