import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AccountSearchParamsValidator = joi.object({
	query: joi
		.object({
			status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required().label("Status")),
            orgId: joi.number().positive().required().label("Organization Id"),
		})
		.concat(CommonSearchParamsValidator),
});
