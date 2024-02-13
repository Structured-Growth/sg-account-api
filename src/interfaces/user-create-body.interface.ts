export interface UserCreateBodyInterface {
	accountId: number;
	firstName: string;
	lastName: string;
	birthday?: Date;
	gender?: "male" | "female";
	status?: "active" | "inactive";
	imageBase64?: string;
}
