import { joi } from "@structured-growth/microservice-sdk";
import { CustomFieldsEnum } from "../modules/custom-fields/custom-fields.enum";
import { getEnumValues } from "../helpers/get-enum-values";

export const CustomFieldCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.customField.orgId"),
		entity: joi
			.string()
			.valid(...getEnumValues(CustomFieldsEnum))
			.required()
			.label("validator.customField.entity"),
		title: joi.string().min(2).max(50).required().label("validator.customField.title"),
		name: joi.string().min(2).max(50).required().label("validator.customField.name"),
		schema: joi.object().label("validator.customField.schema"),
		status: joi.string().valid("active", "inactive").label("validator.customField.status"),
	}),
});
