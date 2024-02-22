import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationCreateParamsValidator = joi.object({
	query: joi.object({
		parentOrgId: joi.number().positive().min(1).required().label("Parent organization Id"),
		name: joi.string().min(3).max(30).required(),
		region: joi.string().min(5).max(15).required(),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
