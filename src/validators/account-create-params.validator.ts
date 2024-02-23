import { joi } from "@structured-growth/microservice-sdk";

export const AccountCreateParamsValidator = joi.object({
	query: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().min(2).required().label("Organization region"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});