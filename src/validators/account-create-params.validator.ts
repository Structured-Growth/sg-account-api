import { joi } from "@structured-growth/microservice-sdk";

export const AccountCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.accounts.orgId"),
		status: joi.string().valid("active", "inactive").label("validator.accounts.status"),
		imageBase64: joi.string().label("validator.accounts.image"),
		metadata: joi.object().label("validator.accounts.metadata"),
	}),
});
