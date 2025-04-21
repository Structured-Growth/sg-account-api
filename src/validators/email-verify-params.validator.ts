import { joi } from "@structured-growth/microservice-sdk";

export const EmailVerifyParamsValidator = joi.object({
	emailId: joi.number().positive().required().label("validator.emails.emailId"),
	query: joi.object(),
	body: joi.object({
		verificationCode: joi.string().length(6).required(),
	}),
});
