import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";
import User from "./user";

export interface EmailAttributes extends DefaultModelInterface {
	userId: number;
	email: string;
	isPrimary: boolean;
	status: "verification" | "active" | "inactive" | "archived";
	verificationCodeHash: string;
	verificationCodeSalt: string;
	verificationCodeExpires: Date;
	metadata?: Record<string, string | number>;
}

export interface EmailCreationAttributes
	extends Omit<EmailAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

@Table({
	tableName: "emails",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Email extends Model<EmailAttributes, EmailCreationAttributes> implements EmailAttributes {
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
	@ForeignKey(() => User)
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@Column
	email: string;

	@Column
	isPrimary: boolean;

	@Column(DataType.STRING)
	status: EmailAttributes["status"];

	@Column
	verificationCodeHash: string;

	@Column
	verificationCodeSalt: string;

	@Column
	verificationCodeExpires: Date;

	@Column(DataType.JSONB)
	metadata?: Record<string, string | number>;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "emails/<emailId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `emails/${this.id}`].join(":");
	}
}

export default Email;
