import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	inject,
	BaseController,
	container,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
	ValidateFuncArgs,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { Organization, OrganizationAttributes } from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "../../interfaces/organization-search-params.interface";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationSearchParamsValidator } from "../../validators/organization-search-params.validator";
import { OrganizationCreateParamsValidator } from "../../validators/organization-create-params.validator";
import { OrganizationUpdateParamsValidator } from "../../validators/organization-update-params.validator";
import { OrganizationService } from "../../modules/organizations/organization.service";
import { OrganizationRepository } from "../../modules/organizations/organization.repository";
import { OrganizationDeleteParamsValidator } from "../../validators/organization-delete-params.validator";
import { OrganizationReadParamsValidator } from "../../validators/organization-read-params.validator";

const publicOrganizationAttributes = [
	"id",
	"parentOrgId",
	"region",
	"title",
	"name",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
	"metadata",
] as const;
type OrganizationKeys = (typeof publicOrganizationAttributes)[number];
type PublicOrganizationAttributes = Pick<OrganizationAttributes, OrganizationKeys> & { imageUrl: string | null };

@Route("v1/organizations")
@Tags("Organizations")
@autoInjectable()
export class OrganizationsController extends BaseController {
	constructor(
		@inject("OrganizationRepository") private organizationsRepository: OrganizationRepository,
		@inject("OrganizationService") private organizationService: OrganizationService
	) {
		super();
	}

	/**
	 * Search Organizations
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of organizations")
	@DescribeAction("organizations/search")
	@DescribeResource("Organization", ({ query }) => Number(query.parentOrgId))
	@DescribeResource(
		"OrganizationStatus",
		({ query }) => query.status as string,
		`${container.resolve("appPrefix")}:<region>:<orgId>:<accountId>:organization-status/<organizationStatus>`
	)
	@ValidateFuncArgs(OrganizationSearchParamsValidator)
	async search(
		@Queries() query: OrganizationSearchParamsInterface
	): Promise<SearchResultInterface<PublicOrganizationAttributes>> {
		const { data, ...result } = await this.organizationsRepository.search(query);

		return {
			data: data.map((organization) => ({
				...(pick(organization.toJSON(), publicOrganizationAttributes) as PublicOrganizationAttributes),
				imageUrl: organization.imageUrl,
				arn: organization.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Organization
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created organization")
	@DescribeAction("organizations/create")
	@DescribeResource("Organization", ({ body }) => Number(body.parentOrgId))
	@ValidateFuncArgs(OrganizationCreateParamsValidator)
	async create(
		@Queries() query: {},
		@Body() body: OrganizationCreateBodyInterface
	): Promise<PublicOrganizationAttributes> {
		const organization = await this.organizationService.create(body);
		this.response.status(201);

		return {
			...(pick(organization.toJSON(), publicOrganizationAttributes) as PublicOrganizationAttributes),
			imageUrl: organization.imageUrl,
			arn: organization.arn,
		};
	}

	/**
	 * Get Organization
	 */
	@OperationId("Read")
	@Get("/:organizationId")
	@SuccessResponse(200, "Returns organization")
	@DescribeAction("organizations/read")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	@ValidateFuncArgs(OrganizationReadParamsValidator)
	async get(@Path() organizationId: number): Promise<PublicOrganizationAttributes> {
		const organization = await this.organizationsRepository.read(organizationId);

		if (!organization) {
			throw new NotFoundError(`Organization ${organizationId} not found`);
		}

		return {
			...(pick(organization.toJSON(), publicOrganizationAttributes) as PublicOrganizationAttributes),
			imageUrl: organization.imageUrl,
			arn: organization.arn,
		};
	}

	/**
	 * Update Organization
	 */
	@OperationId("Update")
	@Put("/:organizationId")
	@SuccessResponse(200, "Returns updated organization")
	@DescribeAction("organizations/update")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	@ValidateFuncArgs(OrganizationUpdateParamsValidator)
	async update(
		@Path() organizationId: number,
		@Queries() query: {},
		@Body() body: OrganizationUpdateBodyInterface
	): Promise<PublicOrganizationAttributes> {
		const organization = await this.organizationService.update(organizationId, body);
		this.response.status(201);

		return {
			...(pick(organization.toJSON(), publicOrganizationAttributes) as PublicOrganizationAttributes),
			imageUrl: organization.imageUrl,
			arn: organization.arn,
		};
	}

	/**
	 * Mark Organization as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:organizationId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("organizations/delete")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	@ValidateFuncArgs(OrganizationDeleteParamsValidator)
	async delete(@Path() organizationId: number): Promise<void> {
		const organization = await this.organizationsRepository.read(organizationId);

		if (!organization) {
			throw new NotFoundError(`Organization ${organizationId} not found`);
		}
		await this.organizationsRepository.delete(organizationId);
		this.response.status(204);
	}
}
