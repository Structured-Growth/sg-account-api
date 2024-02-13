import { GroupAttributes } from "../../database/models/group";

export interface GroupUpdateBodyInterface {
	parentGroupId?: number;
	title?: string;
	status?: GroupAttributes["status"];
	imageBase64?: string;
}
