import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	SearchResultInterface,
	ValidateFuncArgs,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import { UserAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "../../interfaces/user-search-params.interface";
import { UserMultiSearchParamsInterface } from "../../interfaces/user-multi-search-params.interface";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "../../interfaces/user-update-body.interface";
import { pick } from "lodash";
import { UsersRepository } from "../../modules/users/users.repository";
import { UsersService } from "../../modules/users/users.service";
import { UserSearchParamsValidator } from "../../validators/user-search-params.validator";
import { UserMultiSearchParamsValidator } from "../../validators/user-multi-search-params.validator";
import { UserCreateParamsValidator } from "../../validators/user-create-params.validator";
import { UserUpdateParamsValidator } from "../../validators/user-update-params.validator";
import { UserDeleteParamsValidator } from "../../validators/user-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicUserAttributes = [
	"id",
	"orgId",
	"accountId",
	"createdAt",
	"updatedAt",
	"firstName",
	"lastName",
	"birthday",
	"gender",
	"isPrimary",
	"status",
	"metadata",
	"arn",
] as const;
type UserKeys = (typeof publicUserAttributes)[number];
type PublicUserAttributes = Pick<UserAttributes, UserKeys> & { imageUrl: string | null };

@Route("v1/users")
@Tags("Users")
@autoInjectable()
export class UsersController extends BaseController {
	constructor(
		@inject("UsersRepository") private usersRepository: UsersRepository,
		@inject("UsersService") private usersService: UsersService
	) {
		super();
	}

	/**
	 * Search Users
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of users")
	@DescribeAction("users/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => query.accountId?.map(Number))
	@ValidateFuncArgs(UserSearchParamsValidator)
	async search(
		@Queries() query: UserSearchParamsInterface
	): Promise<SearchResultInterface<PublicUserAttributes> | Record<number, { [key: string]: any }>> {
		if (Boolean(query.multi) === true) {
			return await this.usersService.multiSearch({
				orgId: query.orgId,
				search: query.search,
				accountType: query.accountType,
			});
		} else {
			const { data, ...result } = await this.usersRepository.search(query);

			return {
				data: data.map((user) => ({
					...(pick(user.toJSON(), publicUserAttributes) as PublicUserAttributes),
					imageUrl: user.imageUrl,
					arn: user.arn,
				})),
				...result,
			};
		}
	}

	// /**
	//  * MultiSearch Users
	//  */
	// @OperationId("Search")
	// @Get("/multi")
	// @SuccessResponse(200, "Returns multi list of users")
	// @DescribeAction("users/multi")
	// @DescribeResource("Organization", ({ query }) => Number(query.orgId))
	// @ValidateFuncArgs(UserMultiSearchParamsValidator)
	// async multiSearch(
	// 	@Queries() query: UserMultiSearchParamsInterface
	// ): Promise<Array<{ userId: number; coincidence: string[] }>> {
	// 	return await this.usersRepository.multiSearch(query);
	// }

	/**
	 * Create User.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created user")
	@DescribeAction("users/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@ValidateFuncArgs(UserCreateParamsValidator)
	async create(@Queries() query: {}, @Body() body: UserCreateBodyInterface): Promise<PublicUserAttributes> {
		const user = await this.usersService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, user.arn, `${this.appPrefix}:users/create`, JSON.stringify(body))
		);

		return {
			...(pick(user.toJSON(), publicUserAttributes) as PublicUserAttributes),
			imageUrl: user.imageUrl,
			arn: user.arn,
		};
	}

	/**
	 * Get User
	 */
	@OperationId("Read")
	@Get("/:userId")
	@SuccessResponse(200, "Returns user")
	@DescribeAction("users/read")
	@DescribeResource("User", ({ params }) => Number(params.userId))
	async get(@Path() userId: number): Promise<PublicUserAttributes> {
		const user = await this.usersRepository.read(userId);

		if (!user) {
			throw new NotFoundError(`User ${userId} not found`);
		}

		return {
			...(pick(user.toJSON(), publicUserAttributes) as PublicUserAttributes),
			imageUrl: user.imageUrl,
			arn: user.arn,
		};
	}

	/**
	 * Update User
	 */
	@OperationId("Update")
	@Put("/:userId")
	@SuccessResponse(200, "Returns updated user")
	@DescribeAction("users/update")
	@DescribeResource("User", ({ params }) => Number(params.userId))
	@ValidateFuncArgs(UserUpdateParamsValidator)
	async update(
		@Path() userId: number,
		@Queries() query: {},
		@Body() body: UserUpdateBodyInterface
	): Promise<PublicUserAttributes> {
		const user = await this.usersService.update(userId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, user.arn, `${this.appPrefix}:users/update`, JSON.stringify(body))
		);

		return {
			...(pick(user.toJSON(), publicUserAttributes) as PublicUserAttributes),
			imageUrl: user.imageUrl,
			arn: user.arn,
		};
	}

	/**
	 * Mark User as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:userId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("users/delete")
	@DescribeResource("User", ({ params }) => Number(params.userId))
	@ValidateFuncArgs(UserDeleteParamsValidator)
	async delete(@Path() userId: number): Promise<void> {
		const user = await this.usersRepository.read(userId);

		if (!user) {
			throw new NotFoundError(`User ${userId} not found`);
		}

		await this.usersRepository.delete(userId);
		await this.eventBus.publish(
			new EventMutation(this.principal.arn, user.arn, `${this.appPrefix}:users/delete`, JSON.stringify({}))
		);
		this.response.status(204);
	}
}
