import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationUpdateParamsValidator = joi.object({
	query: joi.object({
		parentOrgId: joi.number().positive().min(1).required().label("Parent organization Id"),
		name: joi.string().min(3).max(30).required(),
        OrganizationId: joi.number().positive().min(1).required().label("Organization Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
