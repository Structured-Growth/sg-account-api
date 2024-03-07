export interface EmailCreateBodyInterface {
	accountId: number;
	userId: number;
	email: string;
	sendVerificationCode?: boolean;
}
