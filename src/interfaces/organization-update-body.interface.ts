import { OrganizationAttributes } from "../../database/models/organization";

export interface OrganizationUpdateBodyInterface {
	title?: string;
	status?: OrganizationAttributes["status"];
	imageBase64?: string;
}
