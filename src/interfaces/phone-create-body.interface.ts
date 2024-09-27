import { PhoneAttributes } from "../../database/models/phone";

export interface PhoneCreateBodyInterface {
	accountId: number;
	userId: number;
	phoneNumber: string;
	sendVerificationCode?: boolean;
	status?: PhoneAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
