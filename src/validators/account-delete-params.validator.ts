import { joi } from "@structured-growth/microservice-sdk";

export const AccountDeleteParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("validator.accounts.accountId"),
});
