import { joi } from "@structured-growth/microservice-sdk";

export const GroupCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		parentGroupId: joi.number().positive().label("Parent group Id"),
		title: joi.string().min(2).max(50).required().label("Group title"),
		status: joi.string().valid("active", "inactive").required().label("Status"),
		imageBase64: joi.string().label("Image"),
		metadata: joi.object().label("Metadata"),
	}),
});
