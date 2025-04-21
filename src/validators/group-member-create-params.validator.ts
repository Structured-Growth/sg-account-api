import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberCreateParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("validator.groupMembers.groupId"),
	query: joi.object(),
	body: joi.object({
		userId: joi.number().positive().required().label("validator.groupMembers.userId"),
		status: joi.string().valid("active", "inactive").label("validator.groupMembers.status"),
		metadata: joi.object().label("validator.groupMembers.metadata"),
	}),
});
