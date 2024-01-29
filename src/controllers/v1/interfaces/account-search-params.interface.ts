import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface AccountSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	status?: "active" | "inactive";
}
