export interface GroupCreateBodyInterface {
	accountId: number;
	parentGroupId: number;
	title: string;
	status: "active" | "inactive";
	imageBase64?: string;
}
