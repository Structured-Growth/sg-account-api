import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	ValidateFuncArgs,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { AccountAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";
import { AccountCreateBodyInterface } from "../../interfaces/account-create-body.interface";
import { AccountUpdateBodyInterface } from "../../interfaces/account-update-body.interface";
import { AccountRepository } from "../../modules/accounts/accounts.repository";
import { AccountsService } from "../../modules/accounts/accounts.service";
import { AccountSearchParamsValidator } from "../../validators/account-search-params.validator";
import { AccountCreateParamsValidator } from "../../validators/account-create-params.validator";
import { AccountUpdateParamsValidator } from "../../validators/account-update-params.validator";
import { AccountReadParamsValidator } from "../../validators/account-read-params.validator";
import { AccountDeleteParamsValidator } from "../../validators/account-delete-params.validator";

const publicAccountAttributes = ["id", "orgId", "createdAt", "updatedAt", "status", "arn", "metadata"] as const;
type AccountKeys = (typeof publicAccountAttributes)[number];
type PublicAccountAttributes = Pick<AccountAttributes, AccountKeys>;

@Route("v1/accounts")
@Tags("Accounts")
@autoInjectable()
export class AccountsController extends BaseController {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("AccountsService") private accountService: AccountsService
	) {
		super();
	}

	/**
	 * Search Accounts
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of accounts")
	@DescribeAction("accounts/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@ValidateFuncArgs(AccountSearchParamsValidator)
	async search(
		@Queries() query: AccountSearchParamsInterface
	): Promise<SearchResultInterface<PublicAccountAttributes>> {
		const { data, ...result } = await this.accountRepository.search(query);

		return {
			data: data.map((account) => ({
				...(pick(account.toJSON(), publicAccountAttributes) as PublicAccountAttributes),
				arn: account.arn,
			})),
			...result,
		};
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
	@ValidateFuncArgs(AccountCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: AccountCreateBodyInterface): Promise<PublicAccountAttributes> {
		const account = await this.accountService.create(body);
		this.response.status(201);

		return {
			...(pick(account.toJSON(), publicAccountAttributes) as PublicAccountAttributes),
			arn: account.arn,
		};
	}

	/**
	 * Get Account
	 */
	@OperationId("Read")
	@Get("/:accountId")
	@SuccessResponse(200, "Returns account")
	@DescribeAction("accounts/read")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	@ValidateFuncArgs(AccountReadParamsValidator)
	async get(@Path() accountId: number): Promise<PublicAccountAttributes> {
		const account = await this.accountRepository.read(accountId);

		if (!account) {
			throw new NotFoundError(`Account ${accountId} not found`);
		}

		return {
			...(pick(account.toJSON(), publicAccountAttributes) as PublicAccountAttributes),
			arn: account.arn,
		};
	}

	/**
	 * Update Account
	 */
	@OperationId("Update")
	@Put("/:accountId")
	@SuccessResponse(200, "Returns updated account")
	@DescribeAction("accounts/update")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	@ValidateFuncArgs(AccountUpdateParamsValidator)
	async update(
		@Path() accountId: number,
		@Queries() query: {},
		@Body() body: AccountUpdateBodyInterface
	): Promise<PublicAccountAttributes> {
		const account = await this.accountRepository.update(accountId, body);

		return {
			...(pick(account.toJSON(), publicAccountAttributes) as PublicAccountAttributes),
			arn: account.arn,
		};
	}

	/**
	 * Mark Account as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:accountId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("accounts/delete")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	@ValidateFuncArgs(AccountDeleteParamsValidator)
	async delete(@Path() accountId: number): Promise<void> {
		await this.accountRepository.delete(accountId);
		this.response.status(204);
	}
}
