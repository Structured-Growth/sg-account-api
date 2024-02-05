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
	RepositoryInterface,
} from "@structured-growth/microservice-sdk";
import { Organization, OrganizationAttributes } from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "./interfaces/organization-search-params.interface";
import { OrganizationCreateBodyInterface } from "./interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "./interfaces/organization-update-body.interface";
import { OrganizationSearchParamsValidator } from "./validators/organization-search-params.validator";
import { pick } from "lodash";

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
] as const;
type OrganizationKeys = (typeof publicOrganizationAttributes)[number];
type PublicOrganizationAttributes = Pick<OrganizationAttributes, OrganizationKeys> & { imageUrl: string | null };

@Route("v1/organizations")
@Tags("Organizations")
@autoInjectable()
export class OrganizationsController extends BaseController {
	constructor(@inject("OrganizationRepository") private repository: RepositoryInterface<Organization, any, any>) {
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
		const { data, ...result } = await this.repository.search(query);

		return {
			data: data.map((organization) => ({
				...pick(organization.toJSON(), publicOrganizationAttributes),
				imageUrl: organization.imageUrl,
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
	async create(
		@Queries() query: {},
		@Body() body: OrganizationCreateBodyInterface
	): Promise<PublicOrganizationAttributes> {
		return undefined;
	}

	/**
	 * Get Organization
	 */
	@OperationId("Read")
	@Get("/:organizationId")
	@SuccessResponse(200, "Returns organization")
	@DescribeAction("organizations/read")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	async get(@Path() organizationId: number): Promise<PublicOrganizationAttributes> {
		return undefined;
	}

	/**
	 * Update Organization
	 */
	@OperationId("Update")
	@Put("/:organizationId")
	@SuccessResponse(200, "Returns updated organization")
	@DescribeAction("organizations/update")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	async update(
		@Path() organizationId: number,
		@Queries() query: {},
		@Body() body: OrganizationUpdateBodyInterface
	): Promise<PublicOrganizationAttributes> {
		return undefined;
	}

	/**
	 * Mark Organization as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:organizationId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("organizations/delete")
	@DescribeResource("Organization", ({ params }) => Number(params.organizationId))
	async delete(@Path() organizationId: number): Promise<void> {
		return undefined;
	}
}
