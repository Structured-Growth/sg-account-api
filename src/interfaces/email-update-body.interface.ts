import { EmailAttributes } from "../../database/models/email";

export interface EmailUpdateBodyInterface {
	isPrimary?: boolean;
	status?: EmailAttributes["status"];
}
