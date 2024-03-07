import { PhoneAttributes } from "../../database/models/phone";

export interface PhoneUpdateBodyInterface {
	isPrimary?: boolean;
	status?: PhoneAttributes["status"];
}
