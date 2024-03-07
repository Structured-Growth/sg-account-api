import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const SearchEmailParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization ID"),
			accountId: joi.number().positive().required().label("Account ID"),
			userId: joi.number().positive().label("User ID"),
			email: joi.array().items(joi.string().max(50).required()).label("Email"),
			status: joi.array().items(joi.string().valid("verification", "active", "inactive", "archived").required()),
			isPrimary: joi.boolean().label("is Primary"),
		})
		.concat(CommonSearchParamsValidator),
});
