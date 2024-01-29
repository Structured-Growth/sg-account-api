import { Get, Route, Tags, OperationId, SuccessResponse, Queries, Body, Post } from "tsoa";
import { autoInjectable, BaseController, DescribeAction, DescribeResource } from "@structured-growth/microservice-sdk";
import { PreferencesAttributes } from "../../../database/models/preferences";

@Route("v1/preferences")
@Tags("Preferences")
@autoInjectable()
export class PreferencesController extends BaseController {
	/**
	 * Read account preferences
	 */
	@OperationId("Read")
	@Get()
	@SuccessResponse(200, "Returns account preferences")
	@DescribeAction("preferences/read")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	async read(@Queries() query: { accountId: number }): Promise<PreferencesAttributes["preferences"]> {
		return undefined;
	}

	/**
	 * Update account preferences
	 */
	@OperationId("Update")
	@Post()
	@SuccessResponse(200, "Returns updated preferences")
	@DescribeAction("preferences/update")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	async update(
		@Queries() query: {},
		@Body() body: { accountId: number } & Partial<PreferencesAttributes["preferences"]>
	): Promise<PreferencesAttributes["preferences"]> {
		return undefined;
	}
}
