import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OrganizationAttributes } from "../../database/models/organization";

export interface OrganizationSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	parentOrgId: number;
	status?: OrganizationAttributes["status"][];
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `title: ["Starts*", "-*ends"]`
	 */
	title?: string;
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `name: ["Starts*", "-*ends"]`
	 */
	name?: string;
}
