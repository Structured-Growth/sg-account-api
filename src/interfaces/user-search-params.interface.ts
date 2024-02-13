import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { UserAttributes } from "../../database/models/user";

export interface UserSearchParamsInterface extends DefaultSearchParamsInterface {
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
	 * Filter by birthday. Pass two values to search in a range or a single date for exact search.
	 */
	birthday?: Date[];
	gender?: "male" | "female";
	isPrimary?: boolean;
	status?: UserAttributes["status"][];
}
