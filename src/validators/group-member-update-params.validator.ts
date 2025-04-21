import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberUpdateParamsValidator = joi.object({
	groupId: joi.number().required().label("validator.groupMembers.groupId"),
	groupMemberId: joi.number().required().label("validator.groupMembers.groupMemberId"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("validator.groupMembers.status"),
		metadata: joi.object().label("validator.groupMembers.metadata"),
	}),
});
