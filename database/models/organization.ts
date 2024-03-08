import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToOrgInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";

export interface OrganizationAttributes
	extends Omit<DefaultModelInterface, keyof BelongsToOrgInterface | keyof BelongsToAccountInterface> {
	region: RegionEnum;
	parentOrgId: number | null;
	title: string;
	name: string;
	imageUuid: string | null;
	status: "active" | "inactive" | "archived";
}

export interface OrganizationCreationAttributes
	extends Omit<OrganizationAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface OrganizationUpdateAttributes
	extends Pick<OrganizationAttributes, "title" | "name" | "imageUuid" | "status"> {}

@Table({
	tableName: "organizations",
	timestamps: true,
	underscored: true,
})
export class Organization
	extends Model<OrganizationAttributes, OrganizationCreationAttributes>
	implements OrganizationAttributes
{
	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	@ForeignKey(() => Organization)
	parentOrgId: number | null;

	@BelongsTo(() => Organization)
	parentOrg: Organization;

	@Column
	title: string;

	@Column
	name: string;

	@Column
	imageUuid: string | null;

	@Column(DataType.STRING)
	status: OrganizationAttributes["status"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.id].join(":");
	}

	get imageUrl(): string | null {
		const bucketUrl: string = container.resolve("s3PublicDataBucketWebSiteUrl");
		return this.imageUuid ? `${bucketUrl}/organization-pictures/${this.imageUuid}.png` : null;
	}
}

export default Organization;
