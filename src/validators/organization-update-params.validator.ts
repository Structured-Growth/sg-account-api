import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationUpdateParamsValidator = joi.object({
	organizationId: joi.number().positive().required().label("validator.organizations.organizationId"),
	query: joi.object(),
	body: joi.object({
		title: joi.string().min(3).max(50).label("validator.organizations.title"),
		name: joi.string().min(3).max(50).label("validator.organizations.name"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.organizations.status"),
		imageBase64: joi.string().label("validator.organizations.imageBase64"),
		signUpEnabled: joi.boolean().label("validator.organizations.signUpEnabled"),
		metadata: joi.object().label("validator.organizations.metadata"),
		customFieldsOrgId: joi.number().positive().label("validator.organizations.customFieldsOrgId"),
	}),
});
