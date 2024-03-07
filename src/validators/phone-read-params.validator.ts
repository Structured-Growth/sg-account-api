import { joi } from "@structured-growth/microservice-sdk";

export const PhoneReadParamsValidator = joi.object({
	phoneId: joi.number().positive().required().label("Phone Id"),
});
