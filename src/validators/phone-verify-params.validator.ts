import { joi } from "@structured-growth/microservice-sdk";

export const PhoneVerifyParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("Phone Id"),
	query: joi.object(),
	body: joi.object({
		verificationCode: joi.string().length(6).required(),
	}),
});
