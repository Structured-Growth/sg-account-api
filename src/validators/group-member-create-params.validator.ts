import { joi } from "@structured-growth/microservice-sdk";

export const GroupMemberCreateParamsValidator = joi.object({
	query: joi.object({
		parentOrgId: joi.number().positive().required().label("Parent organization Id"),
		title: joi.string().min(3).max(50).required().label("Organization title"),
		name: joi.string().min(3).max(50).label("Organization name"),
		region: joi.string().min(2).required().label("Organization region"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
