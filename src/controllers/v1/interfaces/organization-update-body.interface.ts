export interface OrganizationUpdateBodyInterface {
	title?: string;
	status?: "active" | "inactive";
	imageBase64?: string;
}
