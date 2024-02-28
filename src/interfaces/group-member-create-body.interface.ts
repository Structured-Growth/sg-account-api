export interface GroupMemberCreateBodyInterface {
	groupId: number;
	userId: number;
	status: "active" | "inactive";
}
