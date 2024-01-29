import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OrganizationAttributes } from "../../../../database/models/organization";

export interface OrganizationSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	parentOrgId: number | null;
	status: OrganizationAttributes["status"];
}
