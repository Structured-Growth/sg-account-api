import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		parentOrgId: joi.number().positive().label("validator.organizations.parentOrgId"),
		title: joi.string().min(3).max(50).required().label("validator.organizations.title"),
		name: joi.string().min(3).max(50).required().label("validator.organizations.name"),
		region: joi.string().min(2).required().label("validator.organizations.region"),
		status: joi.string().valid("active", "inactive").label("validator.organizations.status"),
		signUpEnabled: joi.boolean().label("validator.organizations.signUpEnabled"),
		imageBase64: joi.string(),
		metadata: joi.object().label("validator.organizations.metadata"),
	}),
});
