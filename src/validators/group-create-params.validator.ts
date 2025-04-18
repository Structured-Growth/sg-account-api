import { joi } from "@structured-growth/microservice-sdk";

export const GroupCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().label("validator.groups.orgId"),
		accountId: joi.number().positive().required().label("validator.groups.accountId"),
		parentGroupId: joi.number().positive().label("validator.groups.parentGroupId"),
		title: joi.string().min(2).max(50).required().label("validator.groups.title"),
		status: joi.string().valid("active", "inactive").required().label("validator.groups.status"),
		imageBase64: joi.string().label("validator.groups.imageBase64"),
		metadata: joi.object().label("validator.groups.metadata"),
	}),
});
