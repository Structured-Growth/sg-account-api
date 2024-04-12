import { CustomFieldAttributes } from "../../database/models/custom-field";

export interface CustomFieldCreateBodyInterface {
	/**
	 * If organization is not set, custom field will be applicable for all organizations
	 */
	orgId?: number;
	entity: CustomFieldAttributes["entity"];
	title: CustomFieldAttributes["title"];
	name: CustomFieldAttributes["name"];
	schema: CustomFieldAttributes["schema"];
	status?: "active" | "inactive";
}
