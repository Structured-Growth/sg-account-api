import { RegionEnum } from "@structured-growth/microservice-sdk";

export interface OrganizationCreateBodyInterface {
	parentOrgId?: number;
	region: RegionEnum;
	title: string;
	status?: "active" | "inactive";
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
