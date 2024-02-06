import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi.object({
		parentOrgId: joi.number().positive().label("Parent organization Id"),
		name: joi.string(),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
