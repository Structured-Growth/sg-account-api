import { joi } from "@structured-growth/microservice-sdk";

export const CreateEmailParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		userId: joi.number().positive().required().label("User Id"),
		email: joi.string().email().required().label("Email"),
		sendVerificationCode: joi.boolean().label("Send verification code"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
		metadata: joi.object().label("Metadata"),
	}),
});
