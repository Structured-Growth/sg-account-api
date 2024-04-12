import { joi } from "@structured-growth/microservice-sdk";

export const PhoneCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		userId: joi.number().positive().required().label("User Id"),
		phoneNumber: joi
			.string()
			.pattern(/^\+\d{10,15}$/)
			.required()
			.label("Phone number"),
		sendVerificationCode: joi.boolean().label("Send verification code"),
		metadata: joi.object().label("Metadata"),
	}),
});
