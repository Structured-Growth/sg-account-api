import { AccountAttributes } from "../../database/models/account";

export interface AccountCreateBodyInterface {
	orgId: number;
	status?: AccountAttributes["status"];
}
