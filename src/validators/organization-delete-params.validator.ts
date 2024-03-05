import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationDeleteParamsValidator = joi.object({
	organizationId: joi.number().positive().required().label("Organization Id"),
});
