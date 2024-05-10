import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization, { OrganizationAttributes } from "./organization";
import Account from "./account";
import GroupMember from "./group-member";

export interface GroupAttributes extends DefaultModelInterface {
	parentGroupId: number | null;
	title: string;
	name: string;
	imageUuid: string | null;
	status: "active" | "inactive" | "archived";
	metadata?: Record<string, string | number>;
}

export interface GroupCreationAttributes
	extends Omit<GroupAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface GroupUpdateAttributes
	extends Partial<Pick<GroupCreationAttributes, "parentGroupId" | "title" | "status" | "imageUuid" | "metadata">> {}

@Table({
	tableName: "groups",
	timestamps: true,
	underscored: true,
	paranoid: true,
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

	@Column(DataType.JSONB)
	metadata?: Record<string, string | number>;

	@HasMany(() => GroupMember)
	members: GroupMember[];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "groups/<groupId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `groups/${this.id}`].join(":");
	}

	get imageUrl(): string {
		const bucketUrl: string = container.resolve("s3PublicDataBucketWebSiteUrl");
		return this.imageUuid ? `${bucketUrl}/group-pictures/${this.imageUuid}.png` : null;
	}
}

export default Group;
