import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { AccountAttributes } from "../../database/models/account";

export interface AccountSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	status?: AccountAttributes["status"][];
}
