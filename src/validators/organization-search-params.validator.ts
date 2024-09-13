import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi
		.object({
			parentOrgId: joi.number().positive().label("Parent organization Id"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
			title: joi.array().items(joi.string().max(50).required()),
			name: joi.array().items(joi.string().max(50).required()),
			signUpEnabled: joi.boolean().label("Sign Up Enabled"),
			metadata: joi.object().label("Metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
