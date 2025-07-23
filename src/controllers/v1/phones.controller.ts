import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	SearchResultInterface,
	I18nType,
	HashFields,
	MaskFields,
} from "@structured-growth/microservice-sdk";
import { Phone, PhoneAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "../../interfaces/phone-search-params.interface";
import { PhonesRepository } from "../../modules/phones/phones.repository";
import { PhonesService } from "../../modules/phones/phones.service";
import { PhoneCreateBodyInterface } from "../../interfaces/phone-create-body.interface";
import { PhoneUpdateBodyInterface } from "../../interfaces/phone-update-body.interface";
import { PhoneVerifyBodyInterface } from "../../interfaces/phone-verify-body.interface";
import { PhoneSearchParamsValidator } from "../../validators/phone-search-params.validator";
import { PhoneSearchWithPostParamsValidator } from "../../validators/phone-search-with-post-params.validator";
import { PhoneCreateParamsValidator } from "../../validators/phone-create-params.validator";
import { PhoneUpdateParamsValidator } from "../../validators/phone-update-params.validator";
import { NotFoundError, ValidateFuncArgs } from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { PhoneReadParamsValidator } from "../../validators/phone-read-params.validator";
import { PhoneSendCodeParamsValidator } from "../../validators/phone-send-code-params.validator";
import { PhoneVerifyParamsValidator } from "../../validators/phone-verify-params.validator";
import { PhoneDeleteParamsValidator } from "../../validators/phone-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";
import { GroupMemberSearchWithPostParamsValidator } from "../../validators/group-member-search-with-post-params.validator";
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";

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
	"metadata",
] as const;
type PhoneKeys = (typeof publicPhoneAttributes)[number];
type PublicPhoneAttributes = Pick<PhoneAttributes, PhoneKeys>;

@Route("v1/phones")
@Tags("Phones")
@autoInjectable()
export class PhonesController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("PhonesRepository") private phonesRepository: PhonesRepository,
		@inject("PhonesService") private phonesService: PhonesService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
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
	@DescribeResource("Phone", ({ query }) => query.id?.map(Number))
	@HashFields(["phoneNumber"])
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
	 * Search phones with POST
	 */
	@OperationId("Search phones with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of phones")
	@DescribeAction("phones/search")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@DescribeResource("Phone", ({ body }) => body.id?.map(Number))
	@HashFields(["phoneNumber"])
	@ValidateFuncArgs(PhoneSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: PhoneSearchParamsInterface
	): Promise<SearchResultInterface<PublicPhoneAttributes>> {
		const { data, ...result } = await this.phonesRepository.search(body);

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
	@HashFields(["phoneNumber"])
	@ValidateFuncArgs(PhoneCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: PhoneCreateBodyInterface): Promise<PublicPhoneAttributes> {
		const phone = await this.phonesService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, phone.arn, `${this.appPrefix}:phones/create`, JSON.stringify(body))
		);

		return {
			...(pick(phone.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),
			arn: phone.arn,
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
	@HashFields(["phoneNumber"])
	@ValidateFuncArgs(PhoneReadParamsValidator)
	async get(@Path() phoneId: number): Promise<PublicPhoneAttributes> {
		const phone = await this.phonesRepository.read(phoneId);

		if (!phoneId) {
			throw new NotFoundError(
				`${this.i18n.__("error.phone.name")} ${phoneId} ${this.i18n.__("error.common.not_found")}`
			);
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
	@HashFields(["phoneNumber"])
	@ValidateFuncArgs(PhoneUpdateParamsValidator)
	async update(
		@Path() phoneId: number,
		@Queries() query: {},
		@Body() body: PhoneUpdateBodyInterface
	): Promise<PublicPhoneAttributes> {
		const phone = await this.phonesService.update(Number(phoneId), body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, phone.arn, `${this.appPrefix}:phones/update`, JSON.stringify(body))
		);

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
	@ValidateFuncArgs(PhoneSendCodeParamsValidator)
	async sendCode(@Path() phoneId: number): Promise<void> {
		await this.phonesService.sendVerificationCode(phoneId);
		this.response.status(204);
	}

	/**
	 * Verify Phone
	 */
	@OperationId("Verify")
	@Post("/:phoneId/verify")
	@SuccessResponse(200, "Returns verified phone")
	@DescribeAction("phones/verify")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	@HashFields(["phoneNumber"])
	@MaskFields(["verificationCode"])
	@ValidateFuncArgs(PhoneVerifyParamsValidator)
	async verify(
		@Path() phoneId: number,
		@Queries() query: {},
		@Body() body: PhoneVerifyBodyInterface
	): Promise<PublicPhoneAttributes> {
		const phone = await this.phonesService.verifyPhone(phoneId, body.verificationCode);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, phone.arn, `${this.appPrefix}:phones/verify`, JSON.stringify(body))
		);

		return {
			...(pick(phone.toJSON(), publicPhoneAttributes) as PublicPhoneAttributes),
			arn: phone.arn,
		};
	}

	/**
	 * Mark Phone as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:phoneId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("phones/delete")
	@DescribeResource("Phone", ({ params }) => Number(params.phoneId))
	@ValidateFuncArgs(PhoneDeleteParamsValidator)
	async delete(@Path() phoneId: number): Promise<void> {
		const phone = await this.phonesRepository.read(phoneId);

		if (!phoneId) {
			throw new NotFoundError(
				`${this.i18n.__("error.phone.name")} ${phoneId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.phonesRepository.delete(phoneId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, phone.arn, `${this.appPrefix}:phones/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
