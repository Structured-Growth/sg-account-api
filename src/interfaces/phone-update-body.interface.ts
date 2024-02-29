import { PhoneAttributes } from "../../database/models/phone";

export interface PhoneUpdateBodyInterface {
	isPrimary?: boolean;
	// no phone change?
	status?: PhoneAttributes["status"];
}
