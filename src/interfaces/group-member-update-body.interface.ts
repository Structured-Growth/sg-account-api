import { GroupMemberAttributes } from "../../database/models/group-member";

export interface GroupMemberUpdateBodyInterface {
	status?: GroupMemberAttributes["status"];
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
