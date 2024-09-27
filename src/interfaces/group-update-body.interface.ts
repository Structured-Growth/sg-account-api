import { GroupAttributes } from "../../database/models/group";

export interface GroupUpdateBodyInterface {
	parentGroupId?: number;
	title?: string;
	status?: GroupAttributes["status"];
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Custom field must be created before.
	 */
	metadata?: Record<string, string>;
}
