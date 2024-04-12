import { CustomFieldAttributes } from "../../database/models/custom-field";

export interface CustomFieldUpdateBodyInterface {
	entity?: CustomFieldAttributes["entity"];
	title?: CustomFieldAttributes["title"];
	name?: CustomFieldAttributes["name"];
	schema?: CustomFieldAttributes["schema"];
	status?: CustomFieldAttributes["status"];
}
