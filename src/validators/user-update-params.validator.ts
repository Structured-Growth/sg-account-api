import { joi } from "@structured-growth/microservice-sdk";

export const UserUpdateParamsValidator = joi.object({
	userId: joi.number().positive().required().label("validator.users.userId"),
	query: joi.object(),
	body: joi.object({
		firstName: joi.string().min(1).max(50).label("validator.users.firstName"),
		lastName: joi.string().min(1).max(50).label("validator.users.lastName"),
		birthday: joi.date().iso().label("validator.users.birthday"),
		gender: joi.string().valid("male", "female", "unspec"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.users.status"),
		isPrimary: joi.boolean().label("validator.users.isPrimary"),
		imageBase64: joi.string().label("validator.users.imageBase64"),
		metadata: joi.object().label("validator.users.metadata"),
	}),
});
