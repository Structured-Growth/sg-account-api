import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { UserAttributes } from "../../database/models/user";

export interface UserMultiSearchParamsInterface {
	orgId: number;
	search: string;
	accountType: string;
}
