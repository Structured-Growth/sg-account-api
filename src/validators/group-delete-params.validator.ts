import { joi } from "@structured-growth/microservice-sdk";

export const GroupDeleteParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("Group ID"),
});
