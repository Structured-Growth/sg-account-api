import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const SearchEmailParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization ID"),
			accountId: joi.array().items(joi.number().positive()).label("Account Id"),
			userId: joi.array().items(joi.number().positive()).label("User Id"),
			email: joi.array().items(joi.string().max(50).required()).label("Email"),
			status: joi.array().items(joi.string().valid("verification", "active", "inactive", "archived").required()),
			isPrimary: joi.boolean().label("is Primary"),
			metadata: joi.object().label("Metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
