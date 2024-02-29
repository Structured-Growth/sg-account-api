import { joi } from "@structured-growth/microservice-sdk";

export const PhoneCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().required().label("Account Id"),
		userId: joi.number().min(3).max(50).required().label("User title"),
		phoneNumber: joi.string().min(5).max(20).required().label("Phone number"),
	}),
});
