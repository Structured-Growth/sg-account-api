export interface GroupUpdateBodyInterface {
	parentGroupId?: number;
	title?: string;
	status?: "active" | "inactive";
	imageBase64?: string;
}
