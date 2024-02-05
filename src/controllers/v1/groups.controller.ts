import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { GroupAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "./interfaces/group-search-params.interface";
import { GroupCreateBodyInterface } from "./interfaces/group-create-body.interface";
import { GroupUpdateBodyInterface } from "./interfaces/group-update-body.interface";

type PublicGroupAttributes = Pick<
	GroupAttributes,
	"id" | "orgId" | "accountId" | "createdAt" | "updatedAt" | "title" | "name" | "status" | "arn"
> & { imageUrl: string };

@Route("v1/groups")
@Tags("Groups")
@autoInjectable()
export class GroupsController extends BaseController {
	/**
	 * Search Groups
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of groups")
	@DescribeAction("groups/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(@Queries() query: GroupSearchParamsInterface): Promise<SearchResultInterface<PublicGroupAttributes>> {
		return undefined;
	}

	/**
	 * Create Group.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created group")
	@DescribeAction("groups/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	async create(@Queries() query: {}, @Body() body: GroupCreateBodyInterface): Promise<PublicGroupAttributes> {
		return undefined;
	}

	/**
	 * Get Group
	 */
	@OperationId("Read")
	@Get("/:groupId")
	@SuccessResponse(200, "Returns group")
	@DescribeAction("groups/read")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	async get(@Path() groupId: number): Promise<PublicGroupAttributes> {
		return undefined;
	}

	/**
	 * Update Group
	 */
	@OperationId("Update")
	@Put("/:groupId")
	@SuccessResponse(200, "Returns updated group")
	@DescribeAction("groups/update")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	async update(
		@Path() groupId: number,
		@Queries() query: {},
		@Body() body: GroupUpdateBodyInterface
	): Promise<PublicGroupAttributes> {
		return undefined;
	}

	/**
	 * Mark Group as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:groupId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("groups/delete")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	async delete(@Path() groupId: number): Promise<void> {
		return undefined;
	}
}
