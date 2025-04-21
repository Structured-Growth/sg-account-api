import { joi } from "@structured-growth/microservice-sdk";

export const PhoneDeleteParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("validator.phones.orgId"),
});
