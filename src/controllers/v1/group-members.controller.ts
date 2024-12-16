import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	SearchResultInterface,
	NotFoundError,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { GroupMemberAttributes } from "../../../database/models/group-member";
import { GroupMemberRepository } from "../../modules/group-member/group-member.repository";
import { GroupsRepository } from "../../modules/groups/groups.repository";
import { GroupMemberService } from "../../modules/group-member/group-member.service";
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";
import { GroupMemberCreateBodyInterface } from "../../interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "../../interfaces/group-member-update-body.interface";
import { GroupMemberSearchParamsValidator } from "../../validators/group-member-search-params.validator";
import { GroupMemberSearchWithPostParamsValidator } from "../../validators/group-member-search-with-post-params.validator";
import { GroupMemberCreateParamsValidator } from "../../validators/group-member-create-params.validator";
import { GroupMemberUpdateParamsValidator } from "../../validators/group-member-update-params.validator";
import { pick, result } from "lodash";
import { EventMutation } from "@structured-growth/microservice-sdk";
import { GroupSearchWithPostParamsValidator } from "../../validators/group-search-with-post-params.validator";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";

const publicGroupMemberAttributes = [
	"id",
	"groupId",
	"accountId",
	"userId",
	"createdAt",
	"updatedAt",
	"status",
	"arn",
	"metadata",
] as const;
type GroupMemberKeys = (typeof publicGroupMemberAttributes)[number];
type PublicGroupMemberAttributes = Pick<GroupMemberAttributes, GroupMemberKeys>;

@Route("v1/groups/:groupId/members")
@Tags("Group Members")
@autoInjectable()
export class GroupMembersController extends BaseController {
	constructor(
		@inject("GroupMemberRepository") private groupMemberRepository: GroupMemberRepository,
		@inject("GroupsRepository") private groupsRepository: GroupsRepository,
		@inject("GroupMemberService") private groupMemberService: GroupMemberService
	) {
		super();
	}

	/**
	 * Search group members
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of group members")
	@DescribeAction("group-members/search")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@DescribeResource("User", ({ query }) => query.userId?.map(Number))
	@DescribeResource("GroupMember", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(GroupMemberSearchParamsValidator)
	async search(
		@Path() groupId: number,
		@Queries() query: GroupMemberSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupMemberAttributes>> {
		const { data, ...result } = await this.groupMemberRepository.search({
			groupId,
			...query,
		});

		return {
			data: data.map((groupMember) => ({
				...(pick(groupMember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
				arn: groupMember.arn,
			})),
			...result,
		};
	}

	/**
	 * Search group members with POST
	 */
	@OperationId("Search group members with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of group members")
	@DescribeAction("group-members/search")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@DescribeResource("User", ({ body }) => body.userId?.map(Number))
	@DescribeResource("GroupMember", ({ body }) => body.id?.map(Number))
	@ValidateFuncArgs(GroupMemberSearchWithPostParamsValidator)
	async searchPost(
		@Path() groupId: number,
		@Queries() query: {},
		@Body() body: GroupMemberSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupMemberAttributes>> {
		const { data, ...result } = await this.groupMemberRepository.search({
			groupId,
			...body,
		});

		return {
			data: data.map((groupMember) => ({
				...(pick(groupMember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
				arn: groupMember.arn,
			})),
			...result,
		};
	}

	/**
	 * Add user to a group.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created group member")
	@DescribeAction("group-members/create")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("User", ({ body }) => Number(body.userId))
	@ValidateFuncArgs(GroupMemberCreateParamsValidator)
	async create(
		@Path() groupId: number,
		@Queries() query: {},
		@Body() body: GroupMemberCreateBodyInterface
	): Promise<PublicGroupMemberAttributes> {
		const groupMember = await this.groupMemberService.create(Number(groupId), body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				groupMember.arn,
				`${this.appPrefix}:group-members/create`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(groupMember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
			arn: groupMember.arn,
		};
	}

	/**
	 * Get group member
	 */
	@OperationId("Read")
	@Get(":groupMemberId")
	@SuccessResponse(200, "Returns group member")
	@DescribeAction("group-members/read")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async get(@Path() groupId: number, @Path() groupMemberId: number): Promise<PublicGroupMemberAttributes> {
		const group = await this.groupsRepository.read(groupId);

		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}
		const groupMember = await this.groupMemberRepository.read(groupMemberId);

		if (!groupMember) {
			throw new NotFoundError(`Group member ${groupMemberId} not found`);
		}

		return {
			...(pick(groupMember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
			arn: groupMember.arn,
		};
	}

	/**
	 * Update group member
	 */
	@OperationId("Update")
	@Put(":groupMemberId")
	@SuccessResponse(200, "Returns updated groupMember")
	@DescribeAction("group-members/update")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	@ValidateFuncArgs(GroupMemberUpdateParamsValidator)
	async update(
		@Path() groupId: number,
		@Path() groupMemberId: number,
		@Queries() query: {},
		@Body() body: GroupMemberUpdateBodyInterface
	): Promise<PublicGroupMemberAttributes> {
		const group = await this.groupsRepository.read(groupId);

		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}

		const groupMember = await this.groupMemberService.update(Number(groupMemberId), body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				groupMember.arn,
				`${this.appPrefix}:group-members/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(groupMember.toJSON(), publicGroupMemberAttributes) as PublicGroupMemberAttributes),
			arn: groupMember.arn,
		};
	}

	/**
	 * Remove user from a group
	 */
	@OperationId("Delete")
	@Delete(":groupMemberId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("group-members/delete")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@DescribeResource("GroupMember", ({ params }) => Number(params.groupMemberId))
	async delete(@Path() groupId: number, @Path() groupMemberId: number): Promise<void> {
		const group = await this.groupsRepository.read(groupId);

		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}

		const groupMember = await this.groupMemberRepository.read(groupMemberId);

		if (!groupMember) {
			throw new NotFoundError(`Group member ${groupMemberId} not found`);
		}

		await this.groupMemberRepository.delete(groupMemberId);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				groupMember.arn,
				`${this.appPrefix}:group-members/delete`,
				JSON.stringify({})
			)
		);

		this.response.status(204);
	}
}
