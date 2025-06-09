import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";
import { getEnumValues } from "../helpers/get-enum-values";
import { CustomFieldsEnum } from "../modules/custom-fields/custom-fields.enum";

export const CustomFieldSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.customField.orgId"),
			entity: joi
				.array()
				.items(
					joi
						.string()
						.valid(...getEnumValues(CustomFieldsEnum))
						.required()
				)
				.label("validator.customField.entity"),
			title: joi.array().items(joi.string().max(50).required()).label("validator.customField.title"),
			name: joi.array().items(joi.string().max(50).required()).label("validator.customField.name"),
			status: joi
				.array()
				.items(joi.string().valid("active", "inactive", "archived").required().label("validator.customField.status")),
			includeInherited: joi.boolean().label("validator.customField.includeInherited"),
		})
		.concat(CommonSearchParamsValidator),
});
