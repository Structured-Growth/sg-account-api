import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface GroupSearchParamsInterface extends DefaultSearchParamsInterface {
	parentGroupId?: number;
	status?: "active" | "inactive";
	title?: string;
	name?: string;
}
