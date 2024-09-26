import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
	ValidateFuncArgs,
	NotFoundError,
	inject,
} from "@structured-growth/microservice-sdk";
import { GroupAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";
import { GroupCreateBodyInterface } from "../../interfaces/group-create-body.interface";
import { GroupUpdateBodyInterface } from "../../interfaces/group-update-body.interface";
import { GroupsRepository } from "../../modules/groups/groups.repository";
import { GroupService } from "../../modules/groups/groups.service";
import { GroupSearchParamsValidator } from "../../validators/group-search-params.validator";
import { GroupSearchWithPostParamsValidator } from "../../validators/group-search-with-post-params.validator";
import { GroupCreateParamsValidator } from "../../validators/group-create-params.validator";
import { GroupUpdateParamsValidator } from "../../validators/group-update-params.validator";
import { pick, result } from "lodash";
import { GroupReadParamsValidator } from "../../validators/group-read-params.validator";
import { GroupDeleteParamsValidator } from "../../validators/group-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicGroupAttributes = [
	"id",
	"orgId",
	"accountId",
	"parentGroupId",
	"title",
	"name",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type GroupKeys = (typeof publicGroupAttributes)[number];
type PublicGroupAttributes = Pick<GroupAttributes, GroupKeys> & { imageUrl: string };

@Route("v1/groups")
@Tags("Groups")
@autoInjectable()
export class GroupsController extends BaseController {
	constructor(
		@inject("GroupsRepository") private groupsRepository: GroupsRepository,
		@inject("GroupService") private groupsService: GroupService
	) {
		super();
	}

	/**
	 * Search Groups
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of groups")
	@DescribeAction("groups/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@ValidateFuncArgs(GroupSearchParamsValidator)
	async search(@Queries() query: GroupSearchParamsInterface): Promise<SearchResultInterface<PublicGroupAttributes>> {
		const { data, ...result } = await this.groupsRepository.search(query);

		return {
			data: data.map((group) => ({
				...(pick(group.toJSON(), publicGroupAttributes) as PublicGroupAttributes),
				imageUrl: group.imageUrl,
				arn: group.arn,
			})),
			...result,
		};
	}

	/**
	 * Search Groups with POST
	 */
	@OperationId("Search groups with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of groups")
	@DescribeAction("groups/search")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(GroupSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: GroupSearchParamsInterface
	): Promise<SearchResultInterface<PublicGroupAttributes>> {
		const { data, ...result } = await this.groupsRepository.search(body);

		return {
			data: data.map((group) => ({
				...(pick(group.toJSON(), publicGroupAttributes) as PublicGroupAttributes),
				arn: group.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Group.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created group")
	@DescribeAction("groups/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@ValidateFuncArgs(GroupCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: GroupCreateBodyInterface): Promise<PublicGroupAttributes> {
		const group = await this.groupsService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, group.arn, `${this.appPrefix}:groups/create`, JSON.stringify(body))
		);

		return {
			...(pick(group.toJSON(), publicGroupAttributes) as PublicGroupAttributes),
			imageUrl: group.imageUrl,
			arn: group.arn,
		};
	}

	/**
	 * Get Group
	 */
	@OperationId("Read")
	@Get("/:groupId")
	@SuccessResponse(200, "Returns group")
	@DescribeAction("groups/read")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@ValidateFuncArgs(GroupReadParamsValidator)
	async get(@Path() groupId: number): Promise<PublicGroupAttributes> {
		const group = await this.groupsRepository.read(groupId);

		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}

		return {
			...(pick(group.toJSON(), publicGroupAttributes) as PublicGroupAttributes),
			imageUrl: group.imageUrl,
			arn: group.arn,
		};
	}

	/**
	 * Update Group
	 */
	@OperationId("Update")
	@Put("/:groupId")
	@SuccessResponse(200, "Returns updated group")
	@DescribeAction("groups/update")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@ValidateFuncArgs(GroupUpdateParamsValidator)
	async update(
		@Path() groupId: number,
		@Queries() query: {},
		@Body() body: GroupUpdateBodyInterface
	): Promise<PublicGroupAttributes> {
		const group = await this.groupsService.update(groupId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, group.arn, `${this.appPrefix}:groups/update`, JSON.stringify(body))
		);

		return {
			...(pick(group.toJSON(), publicGroupAttributes) as PublicGroupAttributes),
			imageUrl: group.imageUrl,
			arn: group.arn,
		};
	}

	/**
	 * Mark Group as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:groupId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("groups/delete")
	@DescribeResource("Group", ({ params }) => Number(params.groupId))
	@ValidateFuncArgs(GroupDeleteParamsValidator)
	async delete(@Path() groupId: number): Promise<void> {
		const group = await this.groupsRepository.read(groupId);

		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}

		await this.groupsRepository.delete(groupId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, group.arn, `${this.appPrefix}:groups/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
