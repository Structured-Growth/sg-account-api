import { joi } from "@structured-growth/microservice-sdk";

export const AccountUpdateParamsValidator = joi.object({
	query: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});