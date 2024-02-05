import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { PhoneAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "./interfaces/phone-search-params.interface";
import { PhoneCreateBodyInterface } from "./interfaces/phone-create-body.interface";
import { PhoneUpdateBodyInterface } from "./interfaces/phone-update-body.interface";
import { PhoneVerifyBodyInterface } from "./interfaces/phone-verify-body.interface";

type PublicPhoneAttributes = Pick<
	PhoneAttributes,
	"id" | "orgId" | "accountId" | "userId" | "createdAt" | "updatedAt" | "phoneNumber" | "isPrimary" | "status" | "arn"
>;

@Route("v1/phones")
@Tags("Phones")
@autoInjectable()
export class PhonesController extends BaseController {
	/**
	 * Search Phones
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of phones")
	@DescribeAction("phones/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(@Queries() query: PhoneSearchParamsInterface): Promise<SearchResultInterface<PublicPhoneAttributes>> {
		return undefined;
	}

	/**
	 * Create Phone.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created phone")
	@DescribeAction("phones/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@DescribeResource("User", ({ body }) => Number(body.userId))
	async create(@Queries() query: {}, @Body() body: PhoneCreateBodyInterface): Promise<PublicPhoneAttributes> {
		return undefined;
	}

	/**
	 * Get Phone
	 */
	@OperationId("Read")
	@Get("/:phoneId")
	@SuccessResponse(200, "Returns phone")
	@DescribeAction("phones/read")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	async get(@Path() phoneId: number): Promise<PublicPhoneAttributes> {
		return undefined;
	}

	/**
	 * Update Phone
	 */
	@OperationId("Update")
	@Put("/:phoneId")
	@SuccessResponse(200, "Returns updated phone")
	@DescribeAction("phones/update")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	async update(
		@Path() phoneId: number,
		@Queries() query: {},
		@Body() body: PhoneUpdateBodyInterface
	): Promise<PublicPhoneAttributes> {
		return undefined;
	}

	/**
	 * Send verification code
	 */
	@OperationId("Send code")
	@Post("/:phoneId/send-code")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("phones/send-code")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	async sendCode(@Path() phoneId: number): Promise<void> {
		return undefined;
	}

	/**
	 * Verify Phone
	 */
	@OperationId("Verify")
	@Post("/:phoneId/verify")
	@SuccessResponse(200, "Returns verified phone")
	@DescribeAction("phones/verify")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	async verify(
		@Path() phoneId: number,
		@Queries() query: {},
		@Body() body: PhoneVerifyBodyInterface
	): Promise<PublicPhoneAttributes> {
		return undefined;
	}

	/**
	 * Mark Phone as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:phoneId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("phones/delete")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	async delete(@Path() phoneId: number): Promise<void> {
		return undefined;
	}
}
