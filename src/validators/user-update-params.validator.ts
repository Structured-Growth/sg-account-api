import { joi } from "@structured-growth/microservice-sdk";

export const UserUpdateParamsValidator = joi.object({
	userId: joi.number().positive().required().label("User Id"),
	body: joi.object({
		firstName: joi.string().min(2).max(50).label("First name"),
		lastName: joi.string().min(2).max(50).label("Last name"),
		birthday: joi.date().iso().label("Birthday"),
		gender: joi.string().valid("male", "female"),
		status: joi.string().valid("active", "inactive", "archived").label("Status"),
		isPrimary: joi.boolean().label("Is primary"),
		imageBase64: joi.string().label("Image"),
	}),
});
