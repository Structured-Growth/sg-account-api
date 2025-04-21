import { joi } from "@structured-growth/microservice-sdk";

export const PreferencesUpdateParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("validator.preferences.accountId"),
	query: joi.object(),
	body: joi.object({
		preferences: joi
			.object({
				units: joi.string().valid("imperial", "metric").label("validator.preferences.units"),
				timezone: joi.string().min(2).max(5).label("validator.preferences.timezone"),
				language: joi.string().valid("en", "uk").label("validator.preferences.language"),
				locale: joi.string().valid("US", "UA").label("validator.preferences.locale"),
			})
			.label("Preferences"),
		metadata: joi.object().label("validator.preferences.metadata"),
	}),
});
