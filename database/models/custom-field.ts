import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import Organization from "./organization";

export interface CustomFieldAttributes
	extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface | "orgId" | "region"> {
	orgId?: number;
	region?: RegionEnum;
	entity: "Organization" | "Account" | "User" | "Preferences" | "Phone" | "Email" | "Group" | "GroupMember" | "Metric";
	title: string;
	name: string;
	schema: Record<string, any>;
	status: "active" | "inactive" | "archived";
}

export interface CustomFieldCreationAttributes
	extends Omit<CustomFieldAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface CustomFieldUpdateAttributes
	extends Pick<CustomFieldCreationAttributes, "entity" | "title" | "name" | "schema" | "status"> {}

@Table({
	tableName: "custom_fields",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class CustomField
	extends Model<CustomFieldAttributes, CustomFieldCreationAttributes>
	implements CustomFieldAttributes
{
	@Column
	@ForeignKey(() => Organization)
	orgId: number;

	@BelongsTo(() => Organization)
	org: Organization;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column(DataType.STRING)
	entity: CustomFieldAttributes["entity"];

	@Column(DataType.STRING)
	title: CustomFieldAttributes["title"];

	@Column(DataType.STRING)
	name: CustomFieldAttributes["name"];

	@Column(DataType.JSON)
	schema: CustomFieldAttributes["schema"];

	@Column(DataType.STRING)
	status: CustomFieldAttributes["status"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", `custom-fields/<customFieldId>`].join(
			":"
		);
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId || "-", "-", `custom-fields/${this.id}`].join(":");
	}
}

export default CustomField;
