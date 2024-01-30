import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface UserSearchParamsInterface extends DefaultSearchParamsInterface {
	firstName?: string;
	lastName?: string;
	birthday?: Date;
	gender?: "male" | "female";
	isPrimary?: boolean;
	status?: "active" | "inactive";
}
