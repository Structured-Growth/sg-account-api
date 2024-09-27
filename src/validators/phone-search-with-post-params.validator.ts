import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const PhoneSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			orgId: joi.number().positive().required().label("Organization ID"),
			accountId: joi.array().items(joi.number().positive()).label("Account Id"),
			userId: joi.array().items(joi.number().positive()).label("User Id"),
			phoneNumber: joi.array().items(joi.string().required()).label("Phone number"),
			isPrimary: joi.boolean().label("Is primary"),
			status: joi.array().items(joi.string().valid("verification", "active", "inactive", "archived").label("Status")),
			metadata: joi.object().label("Metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
