import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { EmailAttributes } from "../../database/models/email";

export interface EmailSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	accountId?: number[];
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `email: ["user@*", "-*@example.com"]`
	 */
	email?: string[];
	userId?: number[];
	isPrimary?: boolean;
	status?: EmailAttributes["status"][];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[userType]=doctor
	 */
	"metadata[customFieldName]"?: string;
}
