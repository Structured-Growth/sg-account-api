import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource, inject,
	SearchResultInterface, ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { GroupMemberAttributes } from "../../../database/models/group-member";
import { GroupMemberRepository } from "../../modules/groupmember/groupmember.repository"
import { GroupMemberService } from "../../modules/groupmember/groupmember.service"
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";
import { GroupMemberCreateBodyInterface } from "../../interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "../../interfaces/group-member-update-body.interface";
import { GroupMemberSearchParamsValidator } from "../../validators/group-member-search-params.validator";
import { GroupMemberCreateParamsValidator } from "../../validators/group-member-create-params.validator";
import { GroupMemberUpdateParamsValidator } from "../../validators/group-member-update-params.validator";
import { pick } from "lodash";
import group, { GroupAttributes } from "../../../database/models/group";
import { pick, result } from "lodash";

const publicGroupMemberAttributes = [
		"id",
		"groupId",
		"accountId",
		"userId",
		"createdAt",
		"updatedAt",
		"status",
		"arn",
] as const;
type GroupKeys = (typeof publicGroupMemberAttributes)[number]
type PublicGroupMemberAttributes = Pick<GroupMemberAttributes, GroupKeys>;


@Route("v1/groups")
@Tags("Group Members")
@autoInjectable()
export class GroupMembersController extends BaseController {
	constructor(
		@inject("GroupMemberRepository") private groupmemberRepository: GroupMemberRepository,
		@inject("GroupMemberService") private groupmemberService: GroupMemberService,
){
		super();

	}

	/**
	 * Search group members
	 */
	@OperationId("Search")
	@Get("/:groupId/members")
	@SuccessResponse(200, "Returns list of group members")
	@DescribeAction("group-members/search")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@ValidateFuncArgs(GroupMemberSearchParamsValidator)
	async search(
		@Path() groupId: number,
		@Queries() query: GroupMemberSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupMemberAttributes>> {
		const { data, ...result } = await this.groupmemberRepository.search(query);

		return {
			data: data.map((groupmember) => ({
				...(pick(groupmember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
				arn: groupmember.arn,
			})),
			...result,
			}
		};
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
