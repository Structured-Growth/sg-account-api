import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";
import Group from "./group";
import User from "./user";

export interface GroupMemberAttributes extends DefaultModelInterface {
	groupId: number;
	userId: number;
	status: "active" | "inactive" | "archived";
	metadata?: Record<string, string | number>;
}

export interface GroupMemberCreationAttributes
	extends Omit<GroupMemberAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface GroupMemberUpdateAttributes extends Pick<GroupMemberAttributes, "status" | "metadata"> {}

@Table({
	tableName: "group_members",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class GroupMember
	extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>
	implements GroupMemberAttributes
{
	@Column
	@ForeignKey(() => Organization)
	orgId: number;

	@BelongsTo(() => Organization)
	org: Organization;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	@ForeignKey(() => Group)
	groupId: number | null;

	@BelongsTo(() => Group)
	group: Group;

	@Column
	@ForeignKey(() => Account)
	accountId: number;

	@BelongsTo(() => Account)
	account: Account;

	@Column
	@ForeignKey(() => User)
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@Column(DataType.STRING)
	status: GroupMemberAttributes["status"];

	@Column(DataType.JSONB)
	metadata?: Record<string, string | number>;

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"groups/<groupId>/members/<groupMemberId>",
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			this.accountId,
			`groups/${this.groupId}/members/${this.id}`,
		].join(":");
	}
}

export default GroupMember;
