import { Get, Route, Tags, OperationId, SuccessResponse, Queries, Body, Post, Path } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { PreferencesAttributes } from "../../../database/models/preferences";
import { PreferencesReadParamsValidator } from "../../validators/preferences-read-params.validator";
import { PreferencesService } from "../../modules/preferences/preferences.service";
import { PreferencesUpdateParamsValidator } from "../../validators/preferences-update-params.validator";

@Route("v1/preferences")
@Tags("Preferences")
@autoInjectable()
export class PreferencesController extends BaseController {
	constructor(@inject("PreferencesService") private preferencesService: PreferencesService) {
		super();
	}

	/**
	 * Read account preferences
	 */
	@OperationId("Read")
	@Get(":accountId")
	@SuccessResponse(200, "Returns account preferences")
	@DescribeAction("preferences/read")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	@ValidateFuncArgs(PreferencesReadParamsValidator)
	async read(@Path() accountId: number): Promise<PreferencesAttributes["preferences"]> {
		const preferences = await this.preferencesService.read(accountId);

		return preferences.preferences;
	}

	/**
	 * Update account preferences
	 */
	@OperationId("Update")
	@Post(":accountId")
	@SuccessResponse(200, "Returns updated preferences")
	@DescribeAction("preferences/update")
	@DescribeResource("Account", ({ params }) => Number(params.accountId))
	@ValidateFuncArgs(PreferencesUpdateParamsValidator)
	async update(
		@Path() accountId: number,
		@Queries() query: {},
		@Body() body: Partial<PreferencesAttributes["preferences"]>
	): Promise<PreferencesAttributes["preferences"]> {
		const preferences = await this.preferencesService.update(accountId, body);

		return preferences.preferences;
	}
}
