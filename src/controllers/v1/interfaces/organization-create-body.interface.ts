import { OrganizationAttributes } from "../../../../database/models/organization";

export interface OrganizationCreateBodyInterface {
	parentOrgId: string;
	status: OrganizationAttributes["status"];
}
