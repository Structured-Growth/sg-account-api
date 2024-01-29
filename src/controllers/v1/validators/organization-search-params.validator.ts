import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi.object({
		parentOrgId: joi.number().positive().required().label("Organization Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
