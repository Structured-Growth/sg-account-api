import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";

export interface EmailAttributes extends DefaultModelInterface {
	email: string;
	isPrimary: boolean;
	status: "verification" | "active" | "inactive" | "deleted";
	verificationCodeHash: string;
	verificationCodeSalt: string;
	verificationCodeExpires: Date;
}

export interface EmailCreationAttributes extends Optional<EmailAttributes, "id"> {}

@Table({
	tableName: "emails",
	timestamps: true,
	underscored: true,
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

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "emails/<emailId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `emails/${this.id}`].join(":");
	}
}

export default Email;
