import { joi } from "@structured-growth/microservice-sdk";

export const PhoneCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("validator.phones.accountId"),
		userId: joi.number().positive().required().label("validator.phones.userId"),
		phoneNumber: joi
			.string()
			.pattern(/^\+\d{10,15}$/)
			.required()
			.label("validator.phones.phoneNumber"),
		sendVerificationCode: joi.boolean().label("validator.phones.sendVerificationCode"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
		metadata: joi.object().label("validator.phones.metadata"),
	}),
});
