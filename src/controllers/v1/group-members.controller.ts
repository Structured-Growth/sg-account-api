import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { GroupMemberAttributes } from "../../../database/models/group-member";
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";
import { GroupMemberCreateBodyInterface } from "../../interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "../../interfaces/group-member-update-body.interface";

type PublicGroupMemberAttributes = Pick<
	GroupMemberAttributes,
	"id" | "groupId" | "accountId" | "userId" | "createdAt" | "updatedAt" | "status" | "arn"
>;

@Route("v1/groups")
@Tags("Group Members")
@autoInjectable()
export class GroupMembersController extends BaseController {
	/**
	 * Search group members
	 */
	@OperationId("Search")
	@Get("/:groupId/members")
	@SuccessResponse(200, "Returns list of group members")
	@DescribeAction("group-members/search")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	async search(
		@Path() groupId: number,
		@Queries() query: GroupMemberSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupMemberAttributes>> {
		return undefined;
	}

	/**
	 * Add user to a group.
	 */
	@OperationId("Create")
	@Post("/:groupId/members")
	@SuccessResponse(201, "Returns created group member")
	@DescribeAction("group-members/create")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	async create(
		@Path() groupId: number,
		@Queries() query: {},
		@Body() body: GroupMemberCreateBodyInterface
	): Promise<PublicGroupMemberAttributes> {
		return undefined;
	}

	/**
	 * Get group member
	 */
	@OperationId("Read")
	@Get("/:groupId/members/:groupMemberId")
	@SuccessResponse(200, "Returns group member")
	@DescribeAction("group-members/read")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async get(@Path() groupId: number, @Path() groupMemberId: number): Promise<PublicGroupMemberAttributes> {
		return undefined;
	}

	/**
	 * Update group member
	 */
	@OperationId("Update")
	@Put("/:groupId/members/:groupMemberId")
	@SuccessResponse(200, "Returns updated groupMember")
	@DescribeAction("group-members/update")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async update(
		@Path() groupId: number,
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
	@Delete("/:groupId/members/:groupMemberId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("group-members/delete")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async delete(@Path() groupId: number, @Path() groupMemberId: number): Promise<void> {
		return undefined;
	}
}
