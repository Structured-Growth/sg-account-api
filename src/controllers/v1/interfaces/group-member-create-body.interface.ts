export interface GroupMemberCreateBodyInterface {
	groupId: number;
	accountId: number;
	userId: number;
	status: "active" | "inactive";
}
