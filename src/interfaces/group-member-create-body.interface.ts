export interface GroupMemberCreateBodyInterface {
	accountId: number;
	userId: number;
	status: "active" | "inactive";
}
