import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { GroupAttributes } from "../../database/models/group";

export interface GroupSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	/**
	 * Returns groups where accountId is owner or a member.
	 */
	accountId?: number;
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
}
