import "../../../../src/app/providers";
import { assert } from "chai";
import { createOrganization } from "../../../common/create-organization";
import { createAccount } from "../../../common/create-account";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/groups/:groupId", () => {
	const { server, context } = initTest();

	createOrganization(server, context, {
		contextPath: "organization",
	});

	createAccount(server, context, {
		orgId: (context) => context.organization.id,
		contextPath: "account",
	});

	it("Should create a group", async () => {
		const { statusCode, body } = await server.post("/v1/groups").send({
			accountId: context.account.id,
			title: `group-${context.account.id}`,
			status: "active",
		});
		assert.equal(statusCode, 201);
		context.groupId = body.id;
	});

	it("Should read group", async () => {
		const { statusCode, body } = await server.get(`/v1/groups/${context.groupId}`);
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.orgId, context.organization.id);
		assert.equal(body.accountId, context.account.id);
		assert.isNull(body.parentGroupId);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.title, `group-${context.account.id}`);
		assert.equal(body.name, `group-${context.account.id}`);
		assert.equal(body.status, "active");
		assert.isNull(body.imageUrl);
		assert.isString(body.arn);
	});
});
