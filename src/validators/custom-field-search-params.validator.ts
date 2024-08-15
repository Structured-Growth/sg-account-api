import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const CustomFieldSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			entity: joi
				.array()
				.items(
					joi
						.string()
						.valid("Organization", "Account", "User", "Preferences", "Phone", "Email", "Group", "GroupMember")
						.required()
				)
				.label("Custom field entity"),
			title: joi.array().items(joi.string().max(50).required()).label("Custom field title"),
			name: joi.array().items(joi.string().max(50).required()).label("Custom field name"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
			includeInherited: joi.boolean().label("Include inherited"),
		})
		.concat(CommonSearchParamsValidator),
});
