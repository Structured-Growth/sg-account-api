import { joi } from "@structured-growth/microservice-sdk";

export const EmailValidator = joi.string().email();
