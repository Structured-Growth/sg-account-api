import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const GroupMemberSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			accountId: joi.number().positive().label("validator.groupMembers.accountId"),
			userId: joi.array().items(joi.number().positive().required().label("validator.groupMembers.userId")),
			status: joi
				.array()
				.items(joi.string().valid("active", "inactive", "archived").required().label("validator.groupMembers.status")),
			metadata: joi.object().label("validator.groupMembers.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
