import { joi } from "@structured-growth/microservice-sdk";

export const EmailDeleteParamsValidator = joi.object({
	emailId: joi.number().positive().required().label("validator.emails.emailId"),
});
