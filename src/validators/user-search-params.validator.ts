import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const UserSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
            accountId: joi.number().positive().required().label("Account Id"),
			status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required()),
			firstName: joi.array().valid(joi.string().max(50).required()),
            lastName: joi.array().valid(joi.string().max(50).required()),
            isPrimary: joi.boolean().label("Is primary"),
            birthday: joi.date().label("Birthday"),
            gender: joi.string().valid("male", "female"),

		})
		.concat(CommonSearchParamsValidator),
});
