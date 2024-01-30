import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { UserAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "./interfaces/user-search-params.interface";
import { UserCreateBodyInterface } from "./interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "./interfaces/user-update-body.interface";

type PublicUserAttributes = Pick<
	UserAttributes,
	| "id"
	| "orgId"
	| "region"
	| "accountId"
	| "createdAt"
	| "updatedAt"
	| "firstName"
	| "lastName"
	| "birthday"
	| "gender"
	| "isPrimary"
	| "status"
	| "arn"
> & { imageUrl: string };

@Route("v1/users")
@Tags("Users")
@autoInjectable()
export class UsersController extends BaseController {
	/**
	 * Search Users
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of users")
	@DescribeAction("users/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(@Queries() query: UserSearchParamsInterface): Promise<SearchResultInterface<PublicUserAttributes>> {
		return undefined;
	}

	/**
	 * Create User.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created user")
	@DescribeAction("users/create")
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	async create(@Queries() query: {}, @Body() body: UserCreateBodyInterface): Promise<PublicUserAttributes> {
		return undefined;
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
		return undefined;
	}

	/**
	 * Update User
	 */
	@OperationId("Update")
	@Put("/:userId")
	@SuccessResponse(200, "Returns updated user")
	@DescribeAction("users/update")
	@DescribeResource("User", ({ params }) => Number(params.userId))
	async update(
		@Path() userId: number,
		@Queries() query: {},
		@Body() body: UserUpdateBodyInterface
	): Promise<PublicUserAttributes> {
		return undefined;
	}

	/**
	 * Delete User
	 */
	@OperationId("Delete")
	@Delete("/:userId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("users/delete")
	@DescribeResource("User", ({ params }) => Number(params.userId))
	async delete(@Path() userId: number): Promise<void> {
		return undefined;
	}
}
