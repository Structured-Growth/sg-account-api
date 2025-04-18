import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.groups.orgId"),
			accountId: joi.number().positive().label("validator.groups.accountId"),
			parentGroupId: joi.number().positive().label("validator.groups.parentGroupId"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").label("validator.groups.status")),
			title: joi.array().items(joi.string().max(50).required()),
			name: joi.array().items(joi.string().max(50).required()),
			metadata: joi.object().label("validator.groups.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
