import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupMemberSearchParamsValidator = joi.object({
	query: joi
		.object({
			groupId: joi.array().items(joi.number().positive().required().label("Account Id")),
			userId: joi.array().items(joi.number().positive().required().label("User Id")),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
		})
		.concat(CommonSearchParamsValidator),
});
