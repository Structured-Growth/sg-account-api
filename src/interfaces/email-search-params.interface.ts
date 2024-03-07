import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { EmailAttributes } from "../../database/models/email";

export interface EmailSearchParamsInterface extends DefaultSearchParamsInterface {
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `email: ["user@*", "-*@example.com"]`
	 */
	email?: string[];
	userId?: number;
	isPrimary?: boolean;
	status?: EmailAttributes["status"][];
}
