import { joi } from "@structured-growth/microservice-sdk";

export const PreferencesReadParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("validator.preferences.accountId"),
});
