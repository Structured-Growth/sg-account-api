export interface UserUpdateBodyInterface {
	firstName?: string;
	lastName?: string;
	birthday?: Date;
	gender?: "male" | "female";
	status?: "active" | "inactive";
	isPrimary?: boolean;
	imageBase64?: string;
}
