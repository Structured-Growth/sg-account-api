import { joi } from "@structured-growth/microservice-sdk/.dist";

export const CommonSearchParamsValidator = joi.object({
	id: joi.array().valid(joi.number().positive().required()).label("Entity IDs"),
	arn: joi.array().valid(joi.string().required()).label("Entity ARNs"),
	page: joi.number().positive().label("Page"),
	limit: joi.number().positive().label("Limit"),
	sort: joi.array().valid(joi.string().required()).label("Sort"),
});
