import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi
		.object({
			parentOrgId: joi.number().positive().label("validator.organizations.parentOrgId"),
			status: joi
				.array()
				.items(joi.string().valid("active", "inactive", "archived").required().label("validator.organizations.status")),
			title: joi.array().items(joi.string().max(50).required()),
			name: joi.array().items(joi.string().max(50).required()),
			signUpEnabled: joi.boolean().label("validator.organizations.signUpEnabled"),
			metadata: joi.object().label("validator.organizations.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
