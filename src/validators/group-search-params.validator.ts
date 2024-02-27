import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			accountId: joi.number().positive().required().label("Account Id"),
			parentGroupId: joi.number().positive().required().label("Parent Group Id"),
			status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required().label("Status")),
			title: joi.array().valid(joi.string().max(50).required()),
			name: joi.array().valid(joi.string().max(50).required()),
		})
		.concat(CommonSearchParamsValidator),
});
