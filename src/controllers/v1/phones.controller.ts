import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource, inject,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { Phone, PhoneAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "../../interfaces/phone-search-params.interface";
import { PhonesRepository } from "../../modules/phones/phones.repository";
import { PhonesService } from "../../modules/phones/phones.service";
import { PhoneCreateBodyInterface } from "../../interfaces/phone-create-body.interface";
import { PhoneUpdateBodyInterface } from "../../interfaces/phone-update-body.interface";
import { PhoneVerifyBodyInterface } from "../../interfaces/phone-verify-body.interface";
import { PhoneSearchParamsValidator } from "../../validators/phone-search-params.validator";
import { PhoneCreateParamsValidator } from "../../validators/phone-create-params.validator";
import { PhoneUpdateParamsValidator } from "../../validators/phone-update-params.validator";
import { NotFoundError, ValidateFuncArgs } from "@structured-growth/microservice-sdk";
import { pick } from "lodash";

const publicPhoneAttributes = [
	"id",
	"orgId",
	"accountId",
	"userId",
	"createdAt",
	"updatedAt",
	"phoneNumber",
	"isPrimary",
	"status",
	"arn",
] as const;
type PhoneKeys = (typeof publicPhoneAttributes)[number];
type PublicPhoneAttributes = Pick<PhoneAttributes, PhoneKeys>;
@Route("v1/phones")
@Tags("Phones")
@autoInjectable()
export class PhonesController extends BaseController {
	constructor(
		@inject("PhonesRepository") private phonesRepository: PhonesRepository,
		@inject("PhonesService") private phonesService: PhonesService
	) {
		super();
	}
	/**
	 * Search Phones
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of phones")
	@DescribeAction("phones/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@ValidateFuncArgs(PhoneSearchParamsValidator)
	async search(@Queries() query: PhoneSearchParamsInterface): Promise<SearchResultInterface<PublicPhoneAttributes>> {
		const { data, ...result } = await this.phonesRepository.search(query);
		return {
			data: data.map((phone) => ({
				...(pick(phone.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),
				arn: phone.arn,
			})),
			...result,
		};
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
	@ValidateFuncArgs(PhoneCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: PhoneCreateBodyInterface): Promise<PublicPhoneAttributes> {
		const organization = await this.phonesService.create(body);
		this.response.status(201);

		return {
			...(pick(organization.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),
			arn: organization.arn,
		};
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
		const phone = await this.phonesRepository.read(phoneId);

		if (!phoneId) {
			throw new NotFoundError(`Phone ${phoneId} not found`);
		}
		return {
			...(pick(phone.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),

			arn: phone.arn,
		};
	}

	/**
	 * Update Phone
	 */
	@OperationId("Update")
	@Put("/:phoneId")
	@SuccessResponse(200, "Returns updated phone")
	@DescribeAction("phones/update")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	@ValidateFuncArgs(PhoneUpdateParamsValidator)
	async update(
		@Path() phoneId: number,
		@Queries() query: {},
		@Body() body: PhoneUpdateBodyInterface
	): Promise<PublicPhoneAttributes> {
		const phone = await  this.phonesService.update(phoneId, body);
		this.response.status(201);

		return {
			...(pick(phone.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),
			arn: phone.arn,
		};
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
		const phone = await this.phonesRepository.read(phoneId);

		if (!phone) {
			throw new NotFoundError(`Organization ${phoneId} not found`);
		}
		await this.phonesRepository.delete(phoneId);
		this.response.status(204);
	}
}
