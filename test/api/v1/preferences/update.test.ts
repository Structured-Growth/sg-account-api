import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createCustomField } from "../../../common/create-custom-field";

describe("POST /api/v1/preferences/:accountId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	createCustomField(server, context, {
		orgId: (context) => context.organization.id,
		entity: "Preferences",
		name: "dashboardMode",
		title: "Dashboard Mode",
	});

	it("Should update preferences", async () => {
		const { statusCode, body } = await server.post(`/v1/preferences/${context.account.id}`).send({
			preferences: {
				units: "imperial",
				language: "uk",
				locale: "UA",
				timezone: "EEST",
			},
			metadata: {
				dashboardMode: "compact",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.metadata.dashboardMode, "compact");
	});

	it("Should read updated preferences", async () => {
		const { statusCode, body } = await server.get(`/v1/preferences/${context.account.id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.preferences.units, "imperial");
		assert.equal(body.preferences.language, "uk");
		assert.equal(body.preferences.locale, "UA");
		assert.equal(body.preferences.timezone, "EEST");
		assert.equal(body.metadata.dashboardMode, "compact");
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post(`/v1/preferences/${context.account.id}`).send({
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error for invalid metadata payload", async () => {
		const { statusCode, body } = await server.post(`/v1/preferences/${context.account.id}`).send({
			metadata: {
				dashboardMode: {
					invalid: true,
				},
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.dashboardMode[0]);
	});
});
