import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Organization from "./organization";
import Account from "./account";

export interface PreferencesAttributes extends DefaultModelInterface {
	preferences: {
		units: "imperial" | "metric";
		timezone: string;
		language: string;
		locale: string;
	};
}

export interface PreferencesCreationAttributes extends Optional<PreferencesAttributes, "id"> {}

@Table({
	tableName: "preferences",
	timestamps: true,
	underscored: true,
})
export class Preferences
	extends Model<PreferencesAttributes, PreferencesCreationAttributes>
	implements PreferencesAttributes
{
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

	@Column(DataType.JSON)
	preferences: PreferencesAttributes["preferences"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "preferences/<preferencesId>"].join(
			":"
		);
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `preferences/${this.id}`].join(
			":"
		);
	}
}

export default Preferences;
