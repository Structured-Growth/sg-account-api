import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			accountId: joi.number().positive().label("Account Id"),
			parentGroupId: joi.number().positive().label("Parent Group Id"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").label("Status")),
			title: joi.array().items(joi.string().max(50).required()),
			name: joi.array().items(joi.string().max(50).required()),
		})
		.concat(CommonSearchParamsValidator),
});
