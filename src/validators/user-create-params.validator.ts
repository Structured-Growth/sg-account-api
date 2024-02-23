import { joi } from "@structured-growth/microservice-sdk";

export const UserCreateParamsValidator = joi.object({
	query: joi.object({
		firstName: joi.string().min(3).max(50).label("First name"),
        lastName: joi.string().min(3).max(50).label("Last name"),
        accountId: joi.number().positive().required().label("Account Id"),
		status: joi.array().valid(joi.string().valid("active", "inactive", "archived").required().label("Status")),
        isPrimary: joi.boolean().label("Is primary"),
        birthday: joi.date().required().label("Birthday"),
        gender: joi.string().required().valid("male", "female"),
	}),
});