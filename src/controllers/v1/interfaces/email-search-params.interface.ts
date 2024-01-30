import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface EmailSearchParamsInterface extends DefaultSearchParamsInterface {
	email?: string;
	isPrimary?: boolean;
	status?: "verification" | "active" | "inactive";
}
