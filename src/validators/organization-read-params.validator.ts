import { joi } from "@structured-growth/microservice-sdk";

export const OrganizationReadParamsValidator = joi.object({
	organizationId: joi.number().positive().required().label("Organization Id"),
});
