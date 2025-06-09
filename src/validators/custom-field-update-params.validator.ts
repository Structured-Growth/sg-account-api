import { joi } from "@structured-growth/microservice-sdk";
import { getEnumValues } from "../helpers/get-enum-values";
import { CustomFieldsEnum } from "../modules/custom-fields/custom-fields.enum";

export const CustomFieldUpdateParamsValidator = joi.object({
	customFieldId: joi.number().positive().required().label("validator.customField.customFieldId"),
	query: joi.object(),
	body: joi.object({
		entity: joi
			.string()
			.valid(...getEnumValues(CustomFieldsEnum))
			.label("validator.customField.entity"),
		title: joi.string().min(2).max(50).label("validator.customField.title"),
		name: joi.string().min(2).max(50).label("validator.customField.name"),
		schema: joi.object().label("validator.customField.schema"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.customField.status"),
	}),
});
