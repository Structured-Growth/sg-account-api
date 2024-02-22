import slug from "slug";
import { Buffer } from "buffer";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Organization from "../../../database/models/organization";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationRepository } from "./organization.repository";
import { ImageValidator } from "../../validators/image.validator";
import { v4 } from "uuid";

@autoInjectable()
export class OrganizationService {
	constructor(
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator
	) {}

	public async create(params: OrganizationCreateBodyInterface): Promise<Organization> {
		const parentOrg = await this.organizationRepository.read(params.parentOrgId);
		if (!parentOrg) {
			throw new NotFoundError(`Parent organization ${params.parentOrgId} not found`);
		}

		const name = slug(params.title);
		const count = await Organization.count({
			where: { name },
		});

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
			parentOrgId: params.parentOrgId,
			region: params.region,
			title: params.title,
			name: name,
			imageUuid: imageUuid || null,
			status: params.status || "inactive",
		});
	}

	public async update(organizationId, params: OrganizationUpdateBodyInterface): Promise<Organization> {
		const parentOrg = await this.organizationRepository.read(organizationId);
		if (!parentOrg) {
			throw new NotFoundError(`Organization ${organizationId} not found`);
		}

		if (!(await ImageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64")))) {
			throw new ValidationError({
				title: "Invalid image file",
			});
		}

		const name = slug(params.title);
		/*        const count = await Organization.count({
								where: {name},
						});
		
						if (count <= 0) {
								throw new NotFoundError(`Organization ${params.title} not found`);
						}
		*/
		const randomImageUuid = Math.random().toString(36).substring(7);

		return this.organizationRepository.update(organizationId, {
			title: params.title,
			name: name,
			imageUuid: randomImageUuid,
			status: params.status,
		});
	}
}
