import { joi } from "@structured-growth/microservice-sdk";
import { EmailValidator } from "./fields/email.validator";

export const CreateEmailParamsValidator = joi.object({
	query: joi.object().empty(),
	body: joi.object({
		email: EmailValidator.required().label("Email"),
		userId: joi.number().positive().required().label("User ID"),
		accountId: joi.number().positive().required().label("Account ID"),
	}),
});
