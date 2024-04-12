import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberUpdateParamsValidator = joi.object({
	groupId: joi.number().required().label("Group id"),
	groupMemberId: joi.number().required().label("Group member id"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		metadata: joi.object().label("Metadata"),
	}),
});
