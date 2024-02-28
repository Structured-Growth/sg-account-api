import { joi } from "@structured-growth/microservice-sdk";
import { EmailValidator } from "./fields/email.validator";

export const SearchEmailParamsValidator = joi.object({
	query: joi.object().empty(),
	body: joi.object({
		email: EmailValidator.required().label("Email"),
		userId: joi.number().positive().required().label("User ID"),
		status: joi.array().items(joi.string().valid("active", "inactive", "archived").required()),
		isPrimary: joi.boolean().label("is Primary"),
	}),
});
