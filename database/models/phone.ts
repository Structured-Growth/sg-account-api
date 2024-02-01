import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";
import User from "./user";

export interface PhoneAttributes extends DefaultModelInterface {
	userId: number;
	phoneNumber: string;
	isPrimary: boolean;
	status: "verification" | "active" | "inactive" | "archived";
	verificationCodeHash: string;
	verificationCodeSalt: string;
	verificationCodeExpires: Date;
}

export interface PhoneCreationAttributes extends Optional<PhoneAttributes, "id"> {}

@Table({
	tableName: "phones",
	timestamps: true,
	underscored: true,
})
export class Phone extends Model<PhoneAttributes, PhoneCreationAttributes> implements PhoneAttributes {
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
	phoneNumber: string;

	@Column
	isPrimary: boolean;

	@Column(DataType.STRING)
	status: PhoneAttributes["status"];

	@Column
	verificationCodeHash: string;

	@Column
	verificationCodeSalt: string;

	@Column
	verificationCodeExpires: Date;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "phones/<phoneId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `phones/${this.id}`].join(":");
	}
}

export default Phone;
