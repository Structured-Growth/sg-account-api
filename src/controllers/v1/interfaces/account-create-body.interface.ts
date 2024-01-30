export interface AccountCreateBodyInterface {
	orgId: number;
	email: string;
	password: string;
	confirmPassword: string;
	firstName: string;
	lastName: string;
	birthday: Date;
	gender: "male" | "female";
	imageBase64?: string;
}
