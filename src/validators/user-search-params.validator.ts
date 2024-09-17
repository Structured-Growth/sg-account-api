import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const UserSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			accountId: joi.array().items(joi.number().positive()).label("Account Id"),
			firstName: joi.array().items(joi.string().max(50).required()).label("First name"),
			lastName: joi.array().items(joi.string().max(50).required()).label("Last name"),
			birthday: joi.array().items(joi.date().iso().label("Birthday").required().allow(null)).length(2),
			gender: joi.array().items(joi.string().valid("male", "female").required().label("Gender")),
			isPrimary: joi.boolean().label("Is primary"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required()),
			metadata: joi.object(),
			multi: joi.boolean().label("Multi"),
			search: joi.string().max(50).label("Search"),
		})
		.concat(CommonSearchParamsValidator),
});
