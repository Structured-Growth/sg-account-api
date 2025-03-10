import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/preferences/:accountId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should update preferences", async () => {
		const { statusCode, body } = await server.post(`/v1/preferences/${context.account.id}`).send({
			preferences: {
				units: "imperial",
				language: "uk",
				locale: "UA",
				timezone: "EEST",
			},
		});
		assert.equal(statusCode, 200);
	});

	it("Should read updated preferences", async () => {
		const { statusCode, body } = await server.get(`/v1/preferences/${context.account.id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.preferences.units, "imperial");
		assert.equal(body.preferences.language, "uk");
		assert.equal(body.preferences.locale, "UA");
		assert.equal(body.preferences.timezone, "EEST");
	});
});
