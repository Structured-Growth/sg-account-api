import * as slug from "slug";
import { Buffer } from "buffer";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Organization, { OrganizationUpdateAttributes } from "../../../database/models/organization";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationRepository } from "./organization.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class OrganizationService {
	constructor(
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator
	) {}

	public async create(params: OrganizationCreateBodyInterface): Promise<Organization> {
		if (params.parentOrgId) {
			const parentOrg = await this.organizationRepository.read(params.parentOrgId);
			if (!parentOrg) {
				throw new NotFoundError(`Parent organization ${params.parentOrgId} not found`);
			}
		}

		const name = slug(params.title);
		const countResult = await Organization.count({
			where: { name },
			group: [],
		});
		const count = countResult[0]?.count || 0;

		if (count > 0) {
			throw new ValidationError({
				title: "Organization with the same name is already exist",
			});
		}

		let imageUuid = null;

		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: "Invalid image file",
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		return this.organizationRepository.create({
			parentOrgId: params.parentOrgId || null,
			region: params.region,
			title: params.title,
			name: name,
			imageUuid: imageUuid || null,
			status: params.status || "inactive",
		});
	}

	public async update(organizationId, params: OrganizationUpdateBodyInterface): Promise<Organization> {
		const checkOrg = await this.organizationRepository.read(organizationId);
		if (!checkOrg) {
			throw new NotFoundError(`Organization ${organizationId} not found`);
		}

		let name;
		if (params.title) {
			name = slug(params.title);
			const countResult = await Organization.count({
				where: { name },
				group: [],
			});
			const count = countResult[0]?.count || 0;

			if (count > 0) {
				throw new ValidationError({
					title: "Organization with the same name is already exist",
				});
			}
		}

		let imageUuid;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: "Invalid image file",
				});
			}
			// imageUuid = v4();
			// todo remove old image from S3 bucket
			// todo store image to S3 bucket
		}

		return this.organizationRepository.update(
			organizationId,
			omitBy(
				{
					title: params.title,
					name,
					imageUuid,
					status: params.status,
				},
				isUndefined
			) as OrganizationUpdateAttributes
		);
	}
}
