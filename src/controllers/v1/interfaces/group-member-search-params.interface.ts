import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface GroupMemberSearchParamsInterface
	extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId" | "region"> {
	groupId: number;
	accountId?: number;
	userId?: number;
	status?: "active" | "inactive";
}
