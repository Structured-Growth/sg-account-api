export interface EmailCreateBodyInterface {
	accountId: number;
	userId: number;
	email: string;
	sendVerificationCode?: boolean;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
