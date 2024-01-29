import { OrganizationAttributes } from "../../../../database/models/organization";

export interface OrganizationUpdateBodyInterface {
	status?: OrganizationAttributes["status"];
}
