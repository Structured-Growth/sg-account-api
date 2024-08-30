import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupMemberSearchParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("Group Id"),
	query: joi
		.object({
			accountId: joi.number().positive().label("Account Id"),
			userId: joi.array().items(joi.number().positive().required().label("User Id")),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
			metadata: joi.object().label("Metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
