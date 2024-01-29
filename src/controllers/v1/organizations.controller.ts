import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	container,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { OrganizationAttributes } from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "./interfaces/organization-search-params.interface";
import { OrganizationCreateBodyInterface } from "./interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "./interfaces/organization-update-body.interface";
import { OrganizationSearchParamsValidator } from "./validators/organization-search-params.validator";

/**
 * This is just an organization of a controller with search and CRUD operations over a model.
 */
@Route("v1/organizations")
@Tags("OrganizationsController")
@autoInjectable()
export class OrganizationsController extends BaseController {
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
	): Promise<SearchResultInterface<OrganizationAttributes>> {
		return undefined;
	}

	/**
	 * Create Organization
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created organization")
	@DescribeAction("organizations/create")
	@DescribeResource("Organization", ({ query }) => Number(query.parentOrgId))
	async create(@Queries() query: {}, @Body() body: OrganizationCreateBodyInterface): Promise<OrganizationAttributes> {
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
	async get(@Path() organizationId: number): Promise<OrganizationAttributes> {
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
	): Promise<OrganizationAttributes> {
		return undefined;
	}

	/**
	 * Delete Organization
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
