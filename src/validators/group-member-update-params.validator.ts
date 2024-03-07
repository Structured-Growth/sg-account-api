import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberUpdateParamsValidator = joi.object({
	groupId: joi.number().required().label("Group id"),
	query: joi.string(),
	body: joi.object({
		groupMemberId: joi.number().required().label("User id"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
