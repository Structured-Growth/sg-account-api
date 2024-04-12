import { EmailAttributes } from "../../database/models/email";

export interface EmailUpdateBodyInterface {
	isPrimary?: boolean;
	status?: EmailAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
