import { joi } from "@structured-growth/microservice-sdk";

export const ResolveCustomFieldValidateValidator = joi.object({
	body: joi.object({
		entity: joi.string().required().label("validator.customField.entity"),
		orgId: joi.number().positive().label("validator.customField.orgId"),
		data: joi.object().required().label("validator.customField.data"),
	}),
	query: joi.object(),
});
