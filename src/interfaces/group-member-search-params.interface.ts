import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { GroupMemberAttributes } from "../../database/models/group-member";

export interface GroupMemberSearchParamsInterface
	extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId" | "region"> {
	accountId?: number[];
	userId?: number[];
	status?: GroupMemberAttributes["status"][];
}
