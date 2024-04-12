import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import Organization from "./organization";

export interface AccountAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	status: "active" | "inactive" | "archived";
	metadata?: Record<string, string | number>;
}

export interface AccountCreationAttributes
	extends Omit<AccountAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

@Table({
	tableName: "accounts",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
	@Column
	@ForeignKey(() => Organization)
	orgId: number;

	@BelongsTo(() => Organization)
	org: Organization;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column(DataType.STRING)
	status: AccountAttributes["status"];

	@Column(DataType.JSONB)
	metadata?: Record<string, string | number>;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.id].join(":");
	}
}

export default Account;
