import { joi } from "@structured-growth/microservice-sdk";

export const AccountReadParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("Account Id"),
});
