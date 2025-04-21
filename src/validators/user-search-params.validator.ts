import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const UserSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.users.orgId"),
			accountId: joi.array().items(joi.number().positive()).label("validator.users.accountId"),
			firstName: joi.array().items(joi.string().max(50).required()).label("validator.users.firstName"),
			lastName: joi.array().items(joi.string().max(50).required()).label("validator.users.lastName"),
			birthday: joi.array().items(joi.date().iso().label("validator.users.birthday").required().allow(null)).length(2),
			gender: joi.array().items(joi.string().valid("male", "female").required().label("validator.users.gender")),
			isPrimary: joi.boolean().label("validator.users.isPrimary"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required()),
			metadata: joi.object(),
			search: joi.string().max(50).label("validator.users.search"),
			accountMetadata: joi.object().label("validator.users.accountMetadata"),
		})
		.concat(CommonSearchParamsValidator),
});
