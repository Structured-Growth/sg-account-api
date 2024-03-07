import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";
import { createUser } from "../../../common/create-user";

describe("POST /api/v1/phones/:phoneId/send-code", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	createUser(server, context, {
		accountId: (context) => context.account.id,
		contextPath: "user",
	});

	it("Should create primary phone", async () => {
		const { statusCode, body } = await server.post("/v1/phones").send({
			accountId: context.account.id,
			userId: context.user.id,
			phoneNumber: "+15551112233",
		});
		assert.equal(statusCode, 201);
		context.phoneId = body.id;
	});

	it("Should generate and send verification code", async () => {
		const { statusCode, body } = await server.post(`/v1/phones/${context.phoneId}/send-code`);
		assert.equal(statusCode, 204);
	});
});
