import { joi } from "@structured-growth/microservice-sdk";

export const GroupUpdateParamsValidator = joi.object({
	query: joi.object({
		title: joi.string().min(3).max(50).required().label("Organization title"),
		name: joi.string().min(3).max(50).label("Organization name"),
        organizationId: joi.number().positive().required().label("Organization Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
