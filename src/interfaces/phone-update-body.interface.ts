import { PhoneAttributes } from "../../database/models/phone";

export interface PhoneUpdateBodyInterface {
	isPrimary?: boolean;
	status?: PhoneAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
