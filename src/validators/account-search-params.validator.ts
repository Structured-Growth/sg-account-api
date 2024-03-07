import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AccountSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("Organization Id"),
			status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
		})
		.concat(CommonSearchParamsValidator),
});
