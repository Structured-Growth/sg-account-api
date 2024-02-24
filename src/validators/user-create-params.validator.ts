import { joi } from "@structured-growth/microservice-sdk";

export const UserCreateParamsValidator = joi.object({
	body: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		firstName: joi.string().required().min(2).max(50).label("First name"),
		lastName: joi.string().required().min(2).max(50).label("Last name"),
		birthday: joi.date().iso().label("Birthday"),
		gender: joi.string().valid("male", "female"),
		status: joi.string().valid("active", "inactive").label("Status"),
		imageBase64: joi.string().label("Image"),
	}),
});
