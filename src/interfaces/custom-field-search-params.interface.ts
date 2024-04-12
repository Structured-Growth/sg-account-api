import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { CustomFieldAttributes } from "../../database/models/custom-field";

export interface CustomFieldSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	orgId?: number;
	entity?: CustomFieldAttributes["entity"][];
	title?: CustomFieldAttributes["title"][];
	name?: CustomFieldAttributes["name"][];
	status?: CustomFieldAttributes["status"][];
}
