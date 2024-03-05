import { joi } from "@structured-growth/microservice-sdk";

export const UserDeleteParamsValidator = joi.object({
	userId: joi.number().positive().required().label("User Id"),
});
