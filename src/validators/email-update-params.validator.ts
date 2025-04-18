import { joi } from "@structured-growth/microservice-sdk";
import { EmailValidator } from "./fields/email.validator";

export const UpdateEmailParamsValidator = joi.object({
	emailId: joi.number().positive().required().label("validator.emails.emailId"),
	query: joi.object().empty(),
	body: joi.object({
		isPrimary: joi.boolean().label("validator.emails.isPrimary"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
		metadata: joi.object().label("validator.emails.metadata"),
	}),
});
