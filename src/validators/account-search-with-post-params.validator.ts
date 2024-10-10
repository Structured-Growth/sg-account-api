import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AccountSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		id: joi.array().items(joi.number().positive().required()).label("Entity IDs"),
		arn: joi.array().items(joi.string().required()).label("Entity ARNs"),
		page: joi.number().positive().label("Page"),
		limit: joi.number().positive().label("Limit"),
		sort: joi.array().items(joi.string().required()).label("Sort"),
		orgId: joi.number().positive().required().label("Organization Id"),
		status: joi.array().items(joi.string().valid("active", "inactive", "archived").required().label("Status")),
		metadata: joi.object().label("Metadata"),
	}),
});
