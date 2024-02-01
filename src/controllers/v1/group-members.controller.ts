import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { GroupMemberAttributes } from "../../../database/models/group-member";
import { GroupMemberSearchParamsInterface } from "./interfaces/group-member-search-params.interface";
import { GroupMemberCreateBodyInterface } from "./interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "./interfaces/group-member-update-body.interface";

type PublicGroupMemberAttributes = Pick<
	GroupMemberAttributes,
	"id" | "groupId" | "accountId" | "userId" | "createdAt" | "updatedAt" | "status" | "arn"
>;

@Route("v1/group-members")
@Tags("Group Members")
@autoInjectable()
export class GroupMembersController extends BaseController {
	/**
	 * Search group members
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of group members")
	@DescribeAction("group-members/search")
	@DescribeResource("Group", ({ query }) => Number(query.groupId))
	async search(
		@Queries() query: GroupMemberSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupMemberAttributes>> {
		return undefined;
	}

	/**
	 * Add user to a group.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created group member")
	@DescribeAction("group-members/create")
	@DescribeResource("Group", ({ body }) => Number(body.groupId))
	async create(
		@Queries() query: {},
		@Body() body: GroupMemberCreateBodyInterface
	): Promise<PublicGroupMemberAttributes> {
		return undefined;
	}

	/**
	 * Get group member
	 */
	@OperationId("Read")
	@Get("/:groupMemberId")
	@SuccessResponse(200, "Returns group member")
	@DescribeAction("group-members/read")
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async get(@Path() groupMemberId: number): Promise<PublicGroupMemberAttributes> {
		return undefined;
	}

	/**
	 * Update group member
	 */
	@OperationId("Update")
	@Put("/:groupMemberId")
	@SuccessResponse(200, "Returns updated groupMember")
	@DescribeAction("group-members/update")
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async update(
		@Path() groupMemberId: number,
		@Queries() query: {},
		@Body() body: GroupMemberUpdateBodyInterface
	): Promise<PublicGroupMemberAttributes> {
		return undefined;
	}

	/**
	 * Remove user from a group
	 */
	@OperationId("Delete")
	@Delete("/:groupMemberId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("group-members/delete")
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async delete(@Path() groupMemberId: number): Promise<void> {
		return undefined;
	}
}
