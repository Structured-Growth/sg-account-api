import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AccountSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		id: joi.array().items(joi.number().positive().required()).label("validator.accounts.id"),
		arn: joi.array().items(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().items(joi.string().required()).label("validator.common.sort"),
		orgId: joi.number().positive().required().label("validator.accounts.orgId"),
		status: joi
			.array()
			.items(joi.string().valid("active", "inactive", "archived").required().label("validator.accounts.status")),
		metadata: joi.object().label("validator.accounts.metadata"),
	}),
});
