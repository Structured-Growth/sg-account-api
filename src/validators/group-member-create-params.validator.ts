import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberCreateParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("Group Id"),
	query: joi.object(),
	body: joi.object({
		userId: joi.number().positive().required().label("User Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
		metadata: joi.object().label("Metadata"),
	}),
});
