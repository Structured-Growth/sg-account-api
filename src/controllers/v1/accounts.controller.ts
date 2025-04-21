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
	I18nType,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { AccountAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";
import { AccountCreateBodyInterface } from "../../interfaces/account-create-body.interface";
import { AccountUpdateBodyInterface } from "../../interfaces/account-update-body.interface";
import { AccountRepository } from "../../modules/accounts/accounts.repository";
import { AccountsService } from "../../modules/accounts/accounts.service";
import { AccountSearchParamsValidator } from "../../validators/account-search-params.validator";
import { AccountSearchWithPostParamsValidator } from "../../validators/account-search-with-post-params.validator";
import { AccountCreateParamsValidator } from "../../validators/account-create-params.validator";
import { AccountUpdateParamsValidator } from "../../validators/account-update-params.validator";
import { AccountReadParamsValidator } from "../../validators/account-read-params.validator";
import { AccountDeleteParamsValidator } from "../../validators/account-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";
import { UsersRepository } from "../../modules/users/users.repository";

const publicAccountAttributes = ["id", "orgId", "createdAt", "updatedAt", "status", "arn", "metadata"] as const;
type AccountKeys = (typeof publicAccountAttributes)[number];
type PublicAccountAttributes = Pick<AccountAttributes, AccountKeys>;

@Route("v1/accounts")
@Tags("Accounts")
@autoInjectable()
export class AccountsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("UsersRepository") private usersRepository: UsersRepository,
		@inject("AccountsService") private accountService: AccountsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Accounts
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of accounts")
	@DescribeAction("accounts/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => query.id?.map(Number))
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
	 * Search Accounts with POST
	 */
	@OperationId("Search accounts with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of accounts")
	@DescribeAction("accounts/search")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => body.id?.map(Number))
	@ValidateFuncArgs(AccountSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: AccountSearchParamsInterface
	): Promise<SearchResultInterface<PublicAccountAttributes>> {
		const { data, ...result } = await this.accountRepository.search(body);

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

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn, // who performed an action sg-account-api:us:1:1
				account.arn, // on which resource action was performed  sg-account-api:us:1:2
				`${this.appPrefix}:accounts/create`, // sg-account-api:accounts/create
				JSON.stringify(body) // {"orgId": 1, "status": "active"}
			)
		);

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
			throw new NotFoundError(
				`${this.i18n.__("error.account.name")} ${accountId} ${this.i18n.__("error.common.not_found")}`
			);
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

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, account.arn, `${this.appPrefix}:accounts/update`, JSON.stringify(body))
		);

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
		const account = await this.accountRepository.read(accountId);

		if (!account) {
			throw new NotFoundError(
				`${this.i18n.__("error.account.name")} ${accountId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.accountRepository.delete(accountId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, account.arn, `${this.appPrefix}:accounts/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
