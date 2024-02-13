import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { PhoneAttributes } from "../../database/models/phone";

export interface PhoneSearchParamsInterface extends DefaultSearchParamsInterface {
	/**
	 * Wildcards and exclusions are allowed:
	 *
	 * `phoneNumber: ["555*", "*111*", "-*888"]`
	 */
	phoneNumber?: string[];
	userId?: number[];
	isPrimary?: boolean;
	status?: PhoneAttributes["status"][];
}
