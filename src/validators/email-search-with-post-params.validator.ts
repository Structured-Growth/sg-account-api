import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const EmailSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			orgId: joi.number().positive().required().label("validator.emails.orgId"),
			accountId: joi.array().items(joi.number().positive()).label("validator.emails.accountId"),
			userId: joi.array().items(joi.number().positive()).label("validator.emails.userId"),
			email: joi.array().items(joi.string().max(50).required()).label("validator.emails.email"),
			status: joi.array().items(joi.string().valid("verification", "active", "inactive", "archived").required()),
			isPrimary: joi.boolean().label("validator.emails.isPrimary"),
			metadata: joi.object().label("validator.emails.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
