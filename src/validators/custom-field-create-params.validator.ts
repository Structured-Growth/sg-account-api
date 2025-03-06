import { joi } from "@structured-growth/microservice-sdk";

export const CustomFieldCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		entity: joi
			.string()
			.valid("Organization", "Account", "User", "Preferences", "Phone", "Email", "Group", "GroupMember", "Metric")
			.required()
			.label("Entity"),
		title: joi.string().min(2).max(50).required().label("Custom field title"),
		name: joi.string().min(2).max(50).required().label("Custom field name"),
		schema: joi.object().label("Custom field validation schema"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
