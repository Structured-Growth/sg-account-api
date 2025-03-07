import { joi } from "@structured-growth/microservice-sdk";

export const CustomFieldUpdateParamsValidator = joi.object({
	customFieldId: joi.number().positive().required().label("Account Id"),
	query: joi.object(),
	body: joi.object({
		entity: joi
			.string()
			.valid("Organization", "Account", "User", "Preferences", "Phone", "Email", "Group", "GroupMember", "Metric")
			.label("Custom field entity"),
		title: joi.string().min(2).max(50).label("Custom field title"),
		name: joi.string().min(2).max(50).label("Custom field name"),
		schema: joi.object().label("Custom field validation schema"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
	}),
});
