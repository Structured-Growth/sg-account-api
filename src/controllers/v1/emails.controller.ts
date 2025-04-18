import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	inject,
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
	NotFoundError,
	ValidateFuncArgs,
	I18nType,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { EmailAttributes } from "../../../database/models/email";
import { EmailSearchParamsInterface } from "../../interfaces/email-search-params.interface";
import { EmailCreateBodyInterface } from "../../interfaces/email-create-body.interface";
import { EmailUpdateBodyInterface } from "../../interfaces/email-update-body.interface";
import { EmailVerifyBodyInterface } from "../../interfaces/email-verify-body.interface";
import { EmailsService } from "../../modules/emails/emails.service";
import { EmailsRepository } from "../../modules/emails/emails.repository";
import { CreateEmailParamsValidator } from "../../validators/email-create-params.validator";
import { EmailReadParamsValidator } from "../../validators/email-read-params.validator";
import { EmailDeleteParamsValidator } from "../../validators/email-delete-params.validator";
import { UpdateEmailParamsValidator } from "../../validators/email-update-params.validator";
import { EmailSendCodeParamsValidator } from "../../validators/email-send-code-params.validator";
import { EmailVerifyParamsValidator } from "../../validators/email-verify-params.validator";
import { SearchEmailParamsValidator } from "../../validators/email-search-params.validator";
import { EmailSearchWithPostParamsValidator } from "../../validators/email-search-with-post-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";
import { AccountSearchWithPostParamsValidator } from "../../validators/account-search-with-post-params.validator";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";

const publicEmailAttributes = [
	"id",
	"orgId",
	"accountId",
	"userId",
	"createdAt",
	"updatedAt",
	"email",
	"isPrimary",
	"status",
	"arn",
	"metadata",
] as const;
type EmailKeys = (typeof publicEmailAttributes)[number];
type PublicEmailAttributes = Pick<EmailAttributes, EmailKeys>;

@Route("v1/emails")
@Tags("Emails")
@autoInjectable()
export class EmailsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("EmailsRepository") private emailRepository: EmailsRepository,
		@inject("EmailsService") private emailService: EmailsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Emails
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of emails")
	@DescribeAction("emails/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => query.accountId?.map(Number))
	@DescribeResource("Email", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(SearchEmailParamsValidator)
	async search(@Queries() query: EmailSearchParamsInterface): Promise<SearchResultInterface<PublicEmailAttributes>> {
		const { data, ...result } = await this.emailRepository.search(query);

		return {
			data: data.map((email) => ({
				...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
				arn: email.arn,
			})),
			...result,
		};
	}

	/**
	 * Search Emails with POST
	 */
	@OperationId("Search emails with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of emails")
	@DescribeAction("emails/search")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => body.accountId?.map(Number))
	@DescribeResource("Email", ({ body }) => body.id?.map(Number))
	@ValidateFuncArgs(EmailSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: EmailSearchParamsInterface
	): Promise<SearchResultInterface<PublicEmailAttributes>> {
		const { data, ...result } = await this.emailRepository.search(body);

		return {
			data: data.map((email) => ({
				...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
				arn: email.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Email.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created email")
	@DescribeAction("emails/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@DescribeResource("User", ({ body }) => Number(body.userId))
	@ValidateFuncArgs(CreateEmailParamsValidator)
	async create(@Queries() query: {}, @Body() body: EmailCreateBodyInterface): Promise<PublicEmailAttributes> {
		const email = await this.emailService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, email.arn, `${this.appPrefix}:emails/create`, JSON.stringify(body))
		);

		return {
			...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
			arn: email.arn,
		};
	}

	/**
	 * Get Email
	 */
	@OperationId("Read")
	@Get("/:emailId")
	@SuccessResponse(200, "Returns email")
	@DescribeAction("emails/read")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	@ValidateFuncArgs(EmailReadParamsValidator)
	async get(@Path() emailId: number): Promise<PublicEmailAttributes> {
		const email = await this.emailRepository.read(emailId);

		if (!email) {
			throw new NotFoundError(`${this.i18n.__("error.email.name")} ${email} ${this.i18n.__("error.common.not_found")}`);
		}

		return {
			...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
			arn: email.arn,
		};
	}

	/**
	 * Update Email
	 */
	@OperationId("Update")
	@Put("/:emailId")
	@SuccessResponse(200, "Returns updated email")
	@DescribeAction("emails/update")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	@ValidateFuncArgs(UpdateEmailParamsValidator)
	async update(
		@Path() emailId: number,
		@Queries() query: {},
		@Body() body: EmailUpdateBodyInterface
	): Promise<PublicEmailAttributes> {
		const email = await this.emailService.update(Number(emailId), body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, email.arn, `${this.appPrefix}:emails/update`, JSON.stringify(body))
		);

		return {
			...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
			arn: email.arn,
		};
	}

	/**
	 * Send verification code
	 */
	@OperationId("Send code")
	@Post("/:emailId/send-code")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("emails/send-code")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	@ValidateFuncArgs(EmailSendCodeParamsValidator)
	async sendCode(@Path() emailId: number): Promise<void> {
		await this.emailService.sendVerificationEmail(emailId);
		this.response.status(204);
	}

	/**
	 * Verify Email
	 */
	@OperationId("Verify")
	@Post("/:emailId/verify")
	@SuccessResponse(200, "Returns verified email")
	@DescribeAction("emails/verify")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	@ValidateFuncArgs(EmailVerifyParamsValidator)
	async verify(
		@Path() emailId: number,
		@Queries() query: {},
		@Body() body: EmailVerifyBodyInterface
	): Promise<PublicEmailAttributes> {
		const email = await this.emailService.verifyEmail(emailId, body.verificationCode);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, email.arn, `${this.appPrefix}:emails/verify`, JSON.stringify(body))
		);

		return {
			...(pick(email.toJSON(), publicEmailAttributes) as PublicEmailAttributes),
			arn: email.arn,
		};
	}

	/**
	 * Mark Email as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:emailId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("emails/delete")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	@ValidateFuncArgs(EmailDeleteParamsValidator)
	async delete(@Path() emailId: number): Promise<void> {
		const email = await this.emailRepository.read(emailId);

		if (!email) {
			throw new NotFoundError(`${this.i18n.__("error.email.name")} ${email} ${this.i18n.__("error.common.not_found")}`);
		}

		await this.emailRepository.delete(emailId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, email.arn, `${this.appPrefix}:emails/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
