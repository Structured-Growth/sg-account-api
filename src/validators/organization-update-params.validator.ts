import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationUpdateParamsValidator = joi.object({
	organizationId: joi.number().positive().required().label("Organization Id"),
	query: joi.object(),
	body: joi.object({
		title: joi.string().min(3).max(50).label("Organization title"),
		name: joi.string().min(3).max(50).label("Organization name"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		imageBase64: joi.string().label("Image"),
		signUpEnabled: joi.boolean().label("Sign Up Enabled"),
		metadata: joi.object().label("Metadata"),
		customFieldsOrgId: joi.number().positive().label("Org ID for custom fields validation"),
	}),
});
