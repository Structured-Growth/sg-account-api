import { OrganizationAttributes } from "../../database/models/organization";

export interface OrganizationUpdateBodyInterface {
	title?: string;
	name?: string;
	status?: OrganizationAttributes["status"];
	signUpEnabled?: boolean;
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
	customFieldsOrgId?: number;
}
