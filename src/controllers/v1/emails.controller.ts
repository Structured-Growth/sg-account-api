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
} from "@structured-growth/microservice-sdk";
import { isString, pick, size } from "lodash";
import { EmailAttributes } from "../../../database/models/email";
import { EmailSearchParamsInterface } from "../../interfaces/email-search-params.interface";
import { EmailCreateBodyInterface } from "../../interfaces/email-create-body.interface";
import { EmailUpdateBodyInterface } from "../../interfaces/email-update-body.interface";
import { EmailVerifyBodyInterface } from "../../interfaces/email-verify-body.interface";
import { EmailsService } from "../../modules/emails/emails.service";
import { EmailsRepository } from "../../modules/emails/emails.repository";
import { CreateEmailParamsValidator } from "../../validators/email-create-params.validator";
import { SearchEmailParamsValidator } from "../../validators/email-search-params.validator";
import { UpdateEmailParamsValidator } from "../../validators/email-update-params.validator";

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
] as const;
type EmailKeys = (typeof publicEmailAttributes)[number];
type PublicEmailAttributes = Pick<EmailAttributes, EmailKeys>;

@Route("v1/emails")
@Tags("Emails")
@autoInjectable()
export class EmailsController extends BaseController {
	constructor(
		@inject("EmailsRepository") private emailRepository: EmailsRepository,
		@inject("EmailsService") private emailService: EmailsService
	) {
		super();
	}

	/**
	 * Search Emails
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of emails")
	@DescribeAction("emails/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(@Queries() query: EmailSearchParamsInterface): Promise<SearchResultInterface<PublicEmailAttributes>> {
		return {
			data: [],
			page: 1,
			limit: 20,
			total: 0,
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
	async get(@Path() emailId: number): Promise<PublicEmailAttributes> {
		const email = await this.emailRepository.read(emailId);

		if (!email) {
			throw new NotFoundError(`Email ${email} not found`);
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
	async update(
		@Path() emailId: number,
		@Queries() query: {},
		@Body() body: EmailUpdateBodyInterface
	): Promise<PublicEmailAttributes> {
		const email = await this.emailRepository.update(emailId, body);

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
	async sendCode(@Path() emailId: number): Promise<void> {
		return undefined;
	}

	/**
	 * Verify Email
	 */
	@OperationId("Verify")
	@Post("/:emailId/verify")
	@SuccessResponse(200, "Returns verified email")
	@DescribeAction("emails/verify")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	async verify(
		@Path() emailId: number,
		@Queries() query: {},
		@Body() body: EmailVerifyBodyInterface
	): Promise<PublicEmailAttributes> {
		return undefined;
	}

	/**
	 * Mark Email as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:emailId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("emails/delete")
	@DescribeResource("Email", ({ params }) => Number(params.emailId))
	async delete(@Path() emailId: number): Promise<void> {
		this.response.status(204);

		return this.emailRepository.delete(emailId);
	}
}
