export interface GroupMemberUpdateBodyInterface {
	status?: "active" | "inactive";
	groupMemberId: number;
}
