import { UserAttributes } from "../../database/models/user";

export interface UserUpdateBodyInterface {
	firstName?: string;
	lastName?: string;
	birthday?: Date;
	gender?: UserAttributes["gender"];
	status?: UserAttributes["status"];
	isPrimary?: boolean;
	imageBase64?: string;
}
