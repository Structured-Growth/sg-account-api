import { joi } from "@structured-growth/microservice-sdk";

export const AccountUpdateParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("validator.accounts.accountId"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived").label("validator.accounts.status"),
		metadata: joi.object().label("validator.accounts.metadata"),
	}),
});
