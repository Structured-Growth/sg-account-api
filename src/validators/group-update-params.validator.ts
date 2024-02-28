import { joi } from "@structured-growth/microservice-sdk";

export const GroupUpdateParamsValidator = joi.object({

	query: joi.string(),
	body: joi.object({
		parentGroupId: joi.number().positive().label("Parent group Id"),
		title: joi.string().min(3).max(50).label("Group title"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		imageBase64: joi.string().label("Image"),
	}),
});
