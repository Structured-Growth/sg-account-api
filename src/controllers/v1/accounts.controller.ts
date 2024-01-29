import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	container,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { AccountAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "./interfaces/account-search-params.interface";
import { AccountCreateBodyInterface } from "./interfaces/account-create-body.interface";
import { AccountUpdateBodyInterface } from "./interfaces/account-update-body.interface";

type PublicAccountAttributes = Pick<
	AccountAttributes,
	"id" | "orgId" | "region" | "createdAt" | "updatedAt" | "status" | "arn"
>;

@Route("v1/accounts")
@Tags("Accounts")
@autoInjectable()
export class AccountsController extends BaseController {
	/**
	 * Search Accounts
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of accounts")
	@DescribeAction("accounts/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	async search(
		@Queries() query: AccountSearchParamsInterface
	): Promise<SearchResultInterface<PublicAccountAttributes>> {
		return undefined;
	}

	/**
	 * Create Account.
	 * Also creates primary email, user and credentials.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created account")
	@DescribeAction("accounts/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	async create(@Queries() query: {}, @Body() body: AccountCreateBodyInterface): Promise<PublicAccountAttributes> {
		return undefined;
	}

	/**
	 * Get Account
	 */
	@OperationId("Read")
	@Get("/:accountId")
	@SuccessResponse(200, "Returns account")
	@DescribeAction("accounts/read")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	async get(@Path() accountId: number): Promise<PublicAccountAttributes> {
		return undefined;
	}

	/**
	 * Update Account
	 */
	@OperationId("Update")
	@Put("/:accountId")
	@SuccessResponse(200, "Returns updated account")
	@DescribeAction("accounts/update")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	async update(
		@Path() accountId: number,
		@Queries() query: {},
		@Body() body: AccountUpdateBodyInterface
	): Promise<PublicAccountAttributes> {
		return undefined;
	}

	/**
	 * Delete Account
	 */
	@OperationId("Delete")
	@Delete("/:accountId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("accounts/delete")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	async delete(@Path() accountId: number): Promise<void> {
		return undefined;
	}
}
