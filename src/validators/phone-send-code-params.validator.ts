import { joi } from "@structured-growth/microservice-sdk";

export const PhoneSendCodeParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("Phone ID"),
});
