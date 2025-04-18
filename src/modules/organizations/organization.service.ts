import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import Organization, { OrganizationUpdateAttributes } from "../../../database/models/organization";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationRepository } from "./organization.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class OrganizationService {
	private i18n: I18nType;
	constructor(
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: OrganizationCreateBodyInterface): Promise<Organization> {
		if (params.parentOrgId) {
			const parentOrg = await this.organizationRepository.read(params.parentOrgId);
			if (!parentOrg) {
				throw new NotFoundError(
					`${this.i18n.__("error.organization.parent_organization")} ${params.parentOrgId} ${this.i18n.__(
						"error.common.not_found"
					)}`
				);
			}
		}

		const countResult = await Organization.count({
			where: { name: params.name },
			group: [],
		});
		const count = countResult[0]?.count || 0;
		if (count > 0) {
			throw new ValidationError({
				body: {
					name: [this.i18n.__("error.organization.same_name")],
				},
			});
		}

		let imageUuid = null;

		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					body: {
						imageBase64: [this.i18n.__("error.organization.invalid_image_file")],
					},
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		return this.organizationRepository.create({
			parentOrgId: params.parentOrgId || null,
			region: params.region,
			title: params.title,
			name: params.name,
			imageUuid: imageUuid || null,
			signUpEnabled: params.signUpEnabled || true,
			status: params.status || "inactive",
			metadata: params.metadata || {},
		});
	}

	public async update(
		organizationId,
		params: OrganizationUpdateBodyInterface,
		customFieldsOrgId = null
	): Promise<Organization> {
		const checkOrg = await this.organizationRepository.read(organizationId);
		if (!checkOrg) {
			throw new NotFoundError(
				`${this.i18n.__("error.organization.name")} ${organizationId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		if (params.name && params.name !== checkOrg.name) {
			const countResult = await Organization.count({
				where: { name: params.name },
				group: [],
			});
			const count = countResult[0]?.count || 0;

			if (count > 0) {
				throw new ValidationError({
					body: {
						name: [this.i18n.__("error.organization.same_name")],
					},
				});
			}
		}

		let imageUuid;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					body: {
						imageBase64: [this.i18n.__("error.organization.invalid_image_file")],
					},
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
					name: params.name,
					imageUuid,
					signUpEnabled: params.signUpEnabled,
					status: params.status,
					metadata: params.metadata,
				},
				isUndefined
			) as OrganizationUpdateAttributes,
			customFieldsOrgId
		);
	}

	/**
	 * Get list of parent organizations
	 */
	public async getParentOrganizations(orgId: number): Promise<Organization[]> {
		const parentOrganizations = [];
		const organization = await this.organizationRepository.read(orgId);
		let parent = await this.organizationRepository.read(organization.parentOrgId);
		while (parent) {
			parentOrganizations.push(parent);
			parent = await this.organizationRepository.read(parent.parentOrgId);
		}

		return parentOrganizations;
	}
}
