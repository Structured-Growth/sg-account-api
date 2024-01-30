import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface OrganizationSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	parentOrgId: number;
	status?: "active" | "inactive";
	title?: string;
	name?: string;
}
