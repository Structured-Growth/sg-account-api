import { joi } from "@structured-growth/microservice-sdk";

export const GroupUpdateParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("Group ID"),
	query: joi.object(),
	body: joi.object({
		parentGroupId: joi.number().positive().label("Parent group Id"),
		title: joi.string().min(2).max(50).label("Group title"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		imageBase64: joi.string().label("Image"),
	}),
});
