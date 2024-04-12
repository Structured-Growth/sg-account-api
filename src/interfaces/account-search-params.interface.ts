import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { AccountAttributes } from "../../database/models/account";

export interface AccountSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	status?: AccountAttributes["status"][];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[userType]=doctor
	 */
	"metadata[customFieldName]"?: string;
}
