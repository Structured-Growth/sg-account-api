import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi
		.object({
			parentOrgId: joi.number().positive().required().label("Parent organization Id"),
			status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required()),
			title: joi.array().valid(joi.string().max(50).required()),
			name: joi.array().valid(joi.string().max(50).required()),
		})
		.concat(CommonSearchParamsValidator),
});
