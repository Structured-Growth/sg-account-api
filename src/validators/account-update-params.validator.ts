import { joi } from "@structured-growth/microservice-sdk";

export const AccountUpdateParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("Account Id"),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
	}),
});
