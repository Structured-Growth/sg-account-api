import { joi } from "@structured-growth/microservice-sdk";
import { EmailValidator } from "./fields/email.validator";

export const UpdateEmailParamsValidator = joi.object({
	emailId: joi.number().positive().required().label("Email Id"),
	query: joi.object().empty(),
	body: joi.object({
		isPrimary: joi.boolean().label("is Primary"),
		status: joi.string().valid("verification", "active", "inactive", "archived"),
	}),
});
