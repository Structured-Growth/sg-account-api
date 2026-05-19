import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { GroupAttributes } from "../../database/models/group";

export interface GroupSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId" | "orgId"> {
	orgId?: number;
	/**
	 * Returns groups where accountId is owner or a member.
	 */
	accountId?: number;
	includeOwner?: boolean;
	parentGroupId?: number;
	status?: GroupAttributes["status"][];
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `title: ["Starts*", "-*ends"]`
	 */
	title?: string[];
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `name: ["Starts*", "-*ends"]`
	 */
	name?: string[];
	/**
	 * Search by custom field value.
	 * Example: metadata[groupType]=patients
	 */
	"metadata[customFieldName]"?: string;
}
