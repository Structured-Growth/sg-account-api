import { joi } from "@structured-growth/microservice-sdk";

export const UserMultiSearchParamsValidator = joi.object({
	query: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		search: joi.string().max(50).required().label("Search"),
	}),
});
