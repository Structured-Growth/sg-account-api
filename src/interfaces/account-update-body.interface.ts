import { AccountAttributes } from "../../database/models/account";

export interface AccountUpdateBodyInterface {
	status?: AccountAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
