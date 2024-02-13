import { AccountAttributes } from "../../database/models/account";

export interface AccountUpdateBodyInterface {
	status?: AccountAttributes["status"];
}
