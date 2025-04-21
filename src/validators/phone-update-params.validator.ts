import { joi } from "@structured-growth/microservice-sdk";

export const PhoneUpdateParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("validator.phones.phoneId"),
	query: joi.object(),
	body: joi.object({
		isPrimary: joi.boolean().label("validator.phones.isPrimary"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
	}),
	metadata: joi.object().label("validator.phones.metadata"),
});
