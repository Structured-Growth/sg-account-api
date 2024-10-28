export interface UserCreateBodyInterface {
	accountId: number;
	firstName: string;
	lastName: string;
	birthday?: string;
	gender?: "male" | "female" | "unspec";
	status?: "active" | "inactive";
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
