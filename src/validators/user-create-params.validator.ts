import { joi } from "@structured-growth/microservice-sdk";

export const UserCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("validator.users.accountId"),
		firstName: joi.string().required().min(1).max(50).label("validator.users.firstName"),
		lastName: joi.string().required().min(1).max(50).label("validator.users.lastName"),
		birthday: joi.date().iso().label("validator.users.birthday"),
		gender: joi.string().valid("male", "female", "unspec"),
		status: joi.string().valid("active", "inactive").label("validator.users.status"),
		imageBase64: joi.string().label("validator.users.imageBase64"),
		metadata: joi.object().label("validator.users.metadata"),
	}),
});
