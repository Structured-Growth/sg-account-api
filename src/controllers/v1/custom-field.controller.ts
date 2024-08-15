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
import { CustomFieldAttributes } from "../../../database/models/custom-field";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { CustomFieldCreateBodyInterface } from "../../interfaces/custom-field-create-body.interface";
import { CustomFieldUpdateBodyInterface } from "../../interfaces/custom-field-update-body.interface";
import { CustomFieldRepository } from "../../modules/custom-fields/custom-field.repository";
import { CustomFieldService } from "../../modules/custom-fields/custom-field.service";
import { CustomFieldSearchParamsValidator } from "../../validators/custom-field-search-params.validator";
import { CustomFieldCreateParamsValidator } from "../../validators/custom-field-create-params.validator";
import { CustomFieldUpdateParamsValidator } from "../../validators/custom-field-update-params.validator";
import { CustomFieldReadParamsValidator } from "../../validators/custom-field-read-params.validator";
import { CustomFieldDeleteParamsValidator } from "../../validators/custom-field-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicCustomFieldAttributes = [
	"id",
	"orgId",
	"entity",
	"title",
	"name",
	"schema",
	"createdAt",
	"updatedAt",
	"status",
	"arn",
] as const;
type CustomFieldKeys = (typeof publicCustomFieldAttributes)[number];
type PublicCustomFieldAttributes = Pick<CustomFieldAttributes, CustomFieldKeys>;

@Route("v1/custom-fields")
@Tags("Custom Fields")
@autoInjectable()
export class CustomFieldsController extends BaseController {
	constructor(
		@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService
	) {
		super();
	}

	/**
	 * Search Custom Fields
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of custom fields")
	@DescribeAction("custom-fields/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@ValidateFuncArgs(CustomFieldSearchParamsValidator)
	async search(
		@Queries() query: CustomFieldSearchParamsInterface
	): Promise<SearchResultInterface<PublicCustomFieldAttributes>> {
		const { data, ...result } = await this.customFieldService.search({
			...query,
			includeInherited: query.includeInherited?.toString() !== "false",
		});

		return {
			data: data.map((customField) => ({
				...(pick(customField.toJSON(), publicCustomFieldAttributes) as PublicCustomFieldAttributes),
				arn: customField.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Custom Field for an entity.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created custom field")
	@DescribeAction("custom-fields/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(CustomFieldCreateParamsValidator)
	async create(
		@Queries() query: {},
		@Body() body: CustomFieldCreateBodyInterface
	): Promise<PublicCustomFieldAttributes> {
		const customField = await this.customFieldService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				customField.arn,
				`${this.appPrefix}:custom-fields/create`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(customField.toJSON(), publicCustomFieldAttributes) as PublicCustomFieldAttributes),
			arn: customField.arn,
		};
	}

	/**
	 * Get Custom Field
	 */
	@OperationId("Read")
	@Get("/:customFieldId")
	@SuccessResponse(200, "Returns custom field")
	@DescribeAction("custom-fields/read")
	@DescribeResource("CustomField", ({ params }) => Number(params.customFieldId))
	@ValidateFuncArgs(CustomFieldReadParamsValidator)
	async get(@Path() customFieldId: number): Promise<PublicCustomFieldAttributes> {
		const customField = await this.customFieldRepository.read(customFieldId);

		if (!customField) {
			throw new NotFoundError(`CustomField ${customFieldId} not found`);
		}

		return {
			...(pick(customField.toJSON(), publicCustomFieldAttributes) as PublicCustomFieldAttributes),
			arn: customField.arn,
		};
	}

	/**
	 * Update Custom Field
	 */
	@OperationId("Update")
	@Put("/:customFieldId")
	@SuccessResponse(200, "Returns updated custom field")
	@DescribeAction("custom-fields/update")
	@DescribeResource("CustomField", ({ params }) => Number(params.customFieldId))
	@ValidateFuncArgs(CustomFieldUpdateParamsValidator)
	async update(
		@Path() customFieldId: number,
		@Queries() query: {},
		@Body() body: CustomFieldUpdateBodyInterface
	): Promise<PublicCustomFieldAttributes> {
		const customField = await this.customFieldRepository.update(customFieldId, body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				customField.arn,
				`${this.appPrefix}:custom-fields/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(customField.toJSON(), publicCustomFieldAttributes) as PublicCustomFieldAttributes),
			arn: customField.arn,
		};
	}

	/**
	 * Mark Custom Field as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:customFieldId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("custom-fields/delete")
	@DescribeResource("CustomField", ({ params }) => Number(params.customFieldId))
	@ValidateFuncArgs(CustomFieldDeleteParamsValidator)
	async delete(@Path() customFieldId: number): Promise<void> {
		const customField = await this.customFieldRepository.read(customFieldId);

		if (!customField) {
			throw new NotFoundError(`CustomField ${customFieldId} not found`);
		}

		await this.customFieldRepository.delete(customFieldId);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				customField.arn,
				`${this.appPrefix}:custom-fields/delete`,
				JSON.stringify({})
			)
		);

		this.response.status(204);
	}
}
