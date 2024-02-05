import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { EmailAttributes } from "../../../database/models/email";
import { EmailSearchParamsInterface } from "./interfaces/email-search-params.interface";
import { EmailCreateBodyInterface } from "./interfaces/email-create-body.interface";
import { EmailUpdateBodyInterface } from "./interfaces/email-update-body.interface";
import { EmailVerifyBodyInterface } from "./interfaces/email-verify-body.interface";

type PublicEmailAttributes = Pick<
	EmailAttributes,
	"id" | "orgId" | "accountId" | "userId" | "createdAt" | "updatedAt" | "email" | "isPrimary" | "status" | "arn"
>;

@Route("v1/emails")
@Tags("Emails")
@autoInjectable()
export class EmailsController extends BaseController {
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
		return undefined;
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
	async create(@Queries() query: {}, @Body() body: EmailCreateBodyInterface): Promise<PublicEmailAttributes> {
		return undefined;
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
		return undefined;
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
		return undefined;
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
		return undefined;
	}
}
