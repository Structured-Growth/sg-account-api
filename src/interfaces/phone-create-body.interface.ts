export interface PhoneCreateBodyInterface {
	accountId: number;
	userId: number;
	phoneNumber: string;
	sendVerificationCode?: boolean;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
