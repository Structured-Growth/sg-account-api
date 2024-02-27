import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization, { OrganizationAttributes } from "./organization";
import Account from "./account";

export interface GroupAttributes extends DefaultModelInterface {
	parentGroupId: number | null;
	title: string;
	name: string;
	imageUuid: string | null;
	status: "active" | "inactive" | "archived";
}

export interface GroupCreationAttributes extends Optional<GroupAttributes, "id"> {}

export interface GroupUpdateAttributes
	extends Pick<GroupCreationAttributes, "parentGroupId" | "title" | "status" | "imageBase64"> {}


@Table({
	tableName: "groups",
	timestamps: true,
	underscored: true,
})
export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
	@Column
	@ForeignKey(() => Organization)
	orgId: number;

	@BelongsTo(() => Organization)
	org: Organization;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	@ForeignKey(() => Account)
	accountId: number;

	@BelongsTo(() => Account)
	account: Account;

	@Column
	@ForeignKey(() => Group)
	parentGroupId: number | null;

	@BelongsTo(() => Group)
	parentGroup: Group;

	@Column
	title: string;

	@Column
	name: string;

	@Column
	imageUuid: string | null;

	@Column(DataType.STRING)
	status: GroupAttributes["status"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "groups/<groupId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `groups/${this.id}`].join(":");
	}
}

export default Group;
