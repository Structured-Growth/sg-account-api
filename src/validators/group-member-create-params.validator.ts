import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		groupId: joi.number().positive().required().label("Group Id"),
		userId: joi.number().positive().required().label("User Id"),
		status: joi.string().valid("active", "inactive").required().label("Status"),
	}),
});
