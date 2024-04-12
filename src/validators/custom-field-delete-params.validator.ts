import { joi } from "@structured-growth/microservice-sdk";

export const CustomFieldDeleteParamsValidator = joi.object({
	customFieldId: joi.number().positive().required().label("Custom Field Id"),
});
