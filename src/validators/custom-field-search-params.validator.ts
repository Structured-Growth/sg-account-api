import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const CustomFieldSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.customField.orgId"),
			entity: joi.array().items(joi.string().max(50)).label("validator.customField.entity"),
			title: joi.array().items(joi.string().max(50)).label("validator.customField.title"),
			name: joi
				.array()
				.items(
					joi
						.string()
						.pattern(/^[a-zA-Z0-9_-]+$/)
						.max(50)
				)
				.label("validator.customField.name"),
			status: joi
				.array()
				.items(joi.string().valid("active", "inactive", "archived"))
				.label("validator.customField.status"),
			includeInherited: joi.boolean().label("validator.customField.includeInherited"),
		})
		.concat(CommonSearchParamsValidator),
});
