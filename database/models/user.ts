import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";

export interface UserAttributes extends DefaultModelInterface {
	firstName: string;
	lastName: string;
	birthday: string | null;
	gender: "male" | "female";
	imageUuid: string | null;
	isPrimary: boolean;
	status: "active" | "inactive" | "archived";
	metadata?: Record<string, string | number>;
}

export interface UserCreationAttributes
	extends Omit<UserAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface UserUpdateAttributes
	extends Pick<
		UserCreationAttributes,
		"firstName" | "lastName" | "birthday" | "gender" | "imageUuid" | "isPrimary" | "status" | "metadata"
	> {}

@Table({
	tableName: "users",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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
	firstName: string;

	@Column
	lastName: string;

	@Column
	birthday: string;

	@Column(DataType.STRING)
	gender: UserAttributes["gender"];

	@Column
	imageUuid: string;

	@Column
	isPrimary: boolean;

	@Column(DataType.STRING)
	status: UserAttributes["status"];

	@Column(DataType.JSONB)
	metadata?: Record<string, string | number>;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "users/<userId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `users/${this.id}`].join(":");
	}

	get imageUrl(): string | null {
		const bucketUrl: string = container.resolve("s3PublicDataBucketWebSiteUrl");
		return this.imageUuid ? `${bucketUrl}/user-pictures/${this.imageUuid}.png` : null;
	}
}

export default User;
