import { EmailAttributes } from "../../database/models/email";

export interface EmailCreateBodyInterface {
	accountId: number;
	userId: number;
	email: string;
	sendVerificationCode?: boolean;
	status?: EmailAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
