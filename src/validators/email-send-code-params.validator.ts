import { joi } from "@structured-growth/microservice-sdk";

export const EmailSendCodeParamsValidator = joi.object({
	emailId: joi.number().positive().required().label("Email Id"),
});
