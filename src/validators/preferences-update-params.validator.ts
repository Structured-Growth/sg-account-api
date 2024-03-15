import { joi } from "@structured-growth/microservice-sdk";

export const PreferencesUpdateParamsValidator = joi.object({
	accountId: joi.number().positive().required().label("Account Id"),
	query: joi.object(),
	body: joi.object({
		units: joi.string().valid("imperial", "metric").label("Units"),
		timezone: joi.string().min(2).max(5).label("Timezone abbreviation"),
		language: joi.string().valid("en", "uk").label("Language"),
		locale: joi.string().valid("US", "UA").label("Locale"),
	}),
});
