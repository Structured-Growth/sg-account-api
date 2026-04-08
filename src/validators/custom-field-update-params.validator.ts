import { joi } from "@structured-growth/microservice-sdk";

export const CustomFieldUpdateParamsValidator = joi.object({
	customFieldId: joi.number().positive().required().label("validator.customField.customFieldId"),
	query: joi.object(),
	body: joi.object({
		entity: joi.string().max(50).label("validator.customField.entity"),
		title: joi.string().max(50).label("validator.customField.title"),
		name: joi
			.string()
			.pattern(/^[a-zA-Z0-9_-]+$/)
			.max(50)
			.label("validator.customField.name"),
		schema: joi.object().label("validator.customField.schema"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.customField.status"),
	}),
});
