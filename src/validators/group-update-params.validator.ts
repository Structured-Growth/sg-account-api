import { joi } from "@structured-growth/microservice-sdk";

export const GroupUpdateParamsValidator = joi.object({
	groupId: joi.number().positive().required().label("validator.groups.groupId"),
	query: joi.object(),
	body: joi.object({
		parentGroupId: joi.number().positive().label("validator.groups.parentGroupId"),
		title: joi.string().min(2).max(50).label("validator.groups.title"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.groups.status"),
		imageBase64: joi.string().label("validator.groups.imageBase64"),
		metadata: joi.object().label("validator.groups.metadata"),
	}),
});
