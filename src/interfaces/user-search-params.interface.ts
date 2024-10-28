import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { UserAttributes } from "../../database/models/user";

export interface UserSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	search?: string;
	/**
	 * Search by custom entity fields.
	 * Example: accountMetadata: {accountType: patient}
	 * Example: metadata[accountType]=patient
	 */
	"accountMetadata[customFieldName]"?: string;
	accountId?: number[];
	/**
	 * Filter by first name. Multiple filters and wildcards are allowed. Add minus to filter off:
	 *
	 * `firstName: ["John*", "-*son"]`
	 */
	firstName?: string[];
	/**
	 * Filter by last name. Multiple filters and wildcards are allowed. Add minus to filter off:
	 *
	 * `lastName: ["John*", "-*son"]`
	 */
	lastName?: string[];
	/**
	 * Filter by birthday. Pass two values to search in a range.
	 */
	birthday?: string[];
	gender?: ("male" | "female" | "unspec")[];
	isPrimary?: boolean;
	status?: UserAttributes["status"][];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[userType]=doctor
	 */
	"metadata[customFieldName]"?: string;
}
