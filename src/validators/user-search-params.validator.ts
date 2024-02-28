import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const UserSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			accountId: joi.number().positive().required().label("Account Id"),
			firstName: joi.array().items(joi.string().max(50).required()),
			lastName: joi.array().items(joi.string().max(50).required()),
			birthday: joi.array().items(joi.date().iso().label("Birthday").required().allow(null)).length(2),
			gender: joi.array().items(joi.string().valid("male", "female").required().label("Gender")),
			isPrimary: joi.boolean().label("Is primary"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required()),
		})
		.concat(CommonSearchParamsValidator),
});
