import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupMemberSearchParamsValidator = joi.object({
	query: joi
		.object({
			groupId: joi.number().positive().label("Account Id"),
			userId: joi.number().positive().label("User Id"),
			Id: joi.number().positive().label("Group Member Id"),
			status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required().label("Status")),
		})
		.concat(CommonSearchParamsValidator),
});
