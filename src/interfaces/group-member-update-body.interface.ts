import { GroupMemberAttributes } from "../../database/models/group-member";

export interface GroupMemberUpdateBodyInterface {
	status?: GroupMemberAttributes["status"];
}
