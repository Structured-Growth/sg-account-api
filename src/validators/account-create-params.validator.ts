import { joi } from "@structured-growth/microservice-sdk";

export const AccountCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		status: joi.string().valid("active", "inactive").label("Status"),
		imageBase64: joi.string().label("Image"),
	}),
});
