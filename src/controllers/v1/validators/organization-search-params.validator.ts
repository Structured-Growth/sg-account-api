import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationSearchParamsValidator = joi.object({
	query: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		accountId: joi.number().positive().required().label("Account Id"),
		status: joi.string().valid("active", "inactive", "deleted").label("Status"),
	})
});
