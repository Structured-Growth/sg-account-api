import { UserAttributes } from "../../database/models/user";

export interface UserUpdateBodyInterface {
	firstName?: string;
	lastName?: string;
	birthday?: string;
	gender?: UserAttributes["gender"];
	status?: UserAttributes["status"];
	isPrimary?: boolean;
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
