import { joi } from "@structured-growth/microservice-sdk";

export const CreateEmailParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("validator.emails.accountId"),
		userId: joi.number().positive().required().label("validator.emails.userId"),
		email: joi.string().email().required().label("validator.emails.email"),
		sendVerificationCode: joi.boolean().label("validator.emails.sendVerificationCode"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
		metadata: joi.object().label("validator.emails.metadata"),
	}),
});
