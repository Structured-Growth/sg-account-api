import { joi } from "@structured-growth/microservice-sdk";

export const PhoneUpdateParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("Phone Id"),
	query: joi.object(),
	body: joi.object({
		isPrimary: joi.boolean().label("is Primary"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
	}),
	metadata: joi.object().label("Metadata"),
});
