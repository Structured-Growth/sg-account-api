import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const PhoneSearchParamsValidator = joi.object({
	query: joi
		.object({
			phoneNumber: joi.string().min(5).label("Phone number"),
			userId: joi.array().items(joi.number().positive()).required().label("User Id"),
			isPrimary: joi.boolean().label("Is primary"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").label("Status")),
		})
		.concat(CommonSearchParamsValidator),
});
