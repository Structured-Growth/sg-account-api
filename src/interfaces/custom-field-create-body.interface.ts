import { CustomFieldAttributes } from "../../database/models/custom-field";

export interface CustomFieldCreateBodyInterface {
	orgId: number;
	entity: CustomFieldAttributes["entity"];
	title: CustomFieldAttributes["title"];
	name: CustomFieldAttributes["name"];
	schema: CustomFieldAttributes["schema"];
	status?: "active" | "inactive";
}
