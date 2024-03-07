import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationUpdateParamsValidator = joi.object({
	organizationId: joi.number().positive().required().label("Organization Id"),
	query: joi.object(),
	body: joi.object({
		title: joi.string().min(3).max(50).label("Organization title"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		imageBase64: joi.string().label("Image"),
	}),
});
