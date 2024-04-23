import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const PhoneSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization ID"),
			accountId: joi.number().positive().label("Account ID"),
			phoneNumber: joi.array().items(joi.string().required()).label("Phone number"),
			userId: joi.number().positive().label("User ID"),
			isPrimary: joi.boolean().label("Is primary"),
			status: joi.array().items(joi.string().valid("verification", "active", "inactive", "archived").label("Status")),
			metadata: joi.object().label("Metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
