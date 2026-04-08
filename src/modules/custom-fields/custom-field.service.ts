import {
	autoInjectable,
	inject,
	joi,
	validate,
	ValidationError,
	NotFoundError,
	RegionEnum,
	I18nType,
} from "@structured-growth/microservice-sdk";
import { CustomFieldRepository } from "./custom-field.repository";
import { OrganizationRepository } from "../organizations/organization.repository";
import CustomField, { CustomFieldAttributes } from "../../../database/models/custom-field";
import { CustomFieldCreateBodyInterface } from "../../interfaces/custom-field-create-body.interface";
import { CustomFieldUpdateBodyInterface } from "../../interfaces/custom-field-update-body.interface";
import { Op } from "sequelize";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { SearchResultInterface } from "@structured-growth/microservice-sdk";
import { OrganizationService } from "../organizations/organization.service";
import { flatten, map, omit } from "lodash";

@autoInjectable()
export class CustomFieldService {
	private i18n: I18nType;
	constructor(
		@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("OrganizationService") private organizationService: OrganizationService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(data: CustomFieldCreateBodyInterface): Promise<CustomField> {
		let region = RegionEnum.US;
		const organization = await this.organizationRepository.read(data.orgId);

		if (!organization) {
			throw new NotFoundError(
				`${this.i18n.__("error.organization.name")} ${data.orgId} ${this.i18n.__("error.common.not_found")}`
			);
		}
		region = organization.region;

		const duplicate = await this.customFieldRepository.search({
			orgId: [data.orgId],
			entity: [data.entity],
			name: [data.name],
		});

		if (duplicate.data.length > 0) {
			throw new ValidationError({
				body: {
					name: [this.i18n.__("error.custom_field.custom_field_created")],
				},
			});
		}

		return this.customFieldRepository.create({
			...data,
			region,
			status: data.status || "active",
		});
	}

	public async update(id: number, params: CustomFieldUpdateBodyInterface): Promise<CustomField> {
		const customField = await this.customFieldRepository.read(id);

		if (!customField) {
			throw new NotFoundError(
				`${this.i18n.__("error.custom_field.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const nextEntity = params.entity ?? customField.entity;
		const nextName = params.name ?? customField.name;
		const duplicate = await this.customFieldRepository.search({
			orgId: [customField.orgId],
			entity: [nextEntity],
			name: [nextName],
		});

		if (duplicate.data.some((item) => Number(item.id) !== Number(id))) {
			throw new ValidationError({
				body: {
					name: [this.i18n.__("error.custom_field.custom_field_created")],
				},
			});
		}

		return this.customFieldRepository.update(id, params);
	}

	public async search(params: CustomFieldSearchParamsInterface): Promise<SearchResultInterface<CustomField>> {
		if (params.includeInherited) {
			const organizations = await this.organizationService.getParentOrganizations(params.orgId);
			return this.customFieldRepository.search({
				...omit(params, "includeInherited", "orgId"),
				orgId: [params.orgId, ...map(organizations, "id")],
			});
		} else {
			return this.customFieldRepository.search({
				...omit(params, "includeInherited", "orgId"),
				orgId: [params.orgId],
			});
		}
	}

	/**
	 * Validate custom field values but its schemas.
	 * JSON object can be compiled to JSON with schema.describe() method.
	 */
	public async validate(
		entityName: string,
		data: Record<string, unknown>,
		orgId?: number,
		throwError = true
	): Promise<{
		valid: boolean;
		message?: string;
		errors?: object;
	}> {
		if (!orgId) {
			return {
				valid: true,
			};
		}

		const organizations = await this.organizationService.getParentOrganizations(orgId);
		const customFields = await CustomField.findAll({
			where: {
				entity: entityName,
				orgId: {
					[Op.or]: [orgId, ...map(organizations, "id")],
				},
			},
		});
		const validator = joi.object(
			customFields.reduce((acc, item) => {
				acc[item.name] = joi.build(item.schema);
				return acc;
			}, {})
		);

		const { valid, message, errors } = await validate(validator, data);

		if (!valid && throwError) {
			throw new ValidationError({
				body: {
					metadata: errors,
				},
			});
		}

		return { valid, message, errors };
	}
}
