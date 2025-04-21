import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const PhoneSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			orgId: joi.number().positive().required().label("validator.phones.orgId"),
			accountId: joi.array().items(joi.number().positive()).label("validator.phones.accountId"),
			userId: joi.array().items(joi.number().positive()).label("validator.phones.userId"),
			phoneNumber: joi.array().items(joi.string().required()).label("validator.phones.phoneNumber"),
			isPrimary: joi.boolean().label("validator.phones.isPrimary"),
			status: joi
				.array()
				.items(joi.string().valid("verification", "active", "inactive", "archived").label("validator.phones.status")),
			metadata: joi.object().label("validator.phones.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
