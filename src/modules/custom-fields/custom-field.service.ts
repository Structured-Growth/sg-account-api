import {
	autoInjectable,
	inject,
	joi,
	validate,
	ValidationError,
	NotFoundError,
	RegionEnum,
} from "@structured-growth/microservice-sdk";
import { CustomFieldRepository } from "./custom-field.repository";
import { OrganizationRepository } from "../organizations/organization.repository";
import CustomField, { CustomFieldAttributes } from "../../../database/models/custom-field";
import { CustomFieldCreateBodyInterface } from "../../interfaces/custom-field-create-body.interface";
import { Op } from "sequelize";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { SearchResultInterface } from "@structured-growth/microservice-sdk";
import { OrganizationService } from "../organizations/organization.service";
import { flatten, map, omit } from "lodash";

@autoInjectable()
export class CustomFieldService {
	constructor(
		@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("OrganizationService") private organizationService: OrganizationService
	) {}

	public async create(data: CustomFieldCreateBodyInterface): Promise<CustomField> {
		let region = RegionEnum.US;
		const organization = await this.organizationRepository.read(data.orgId);

		if (!organization) {
			throw new NotFoundError(`Organization ${data.orgId} not found`);
		}
		region = organization.region;

		return this.customFieldRepository.create({
			...data,
			region,
			status: data.status || "active",
		});
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

	public async validate(
		entityName: string,
		data: Record<string, string | number>,
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

		const { valid, message, errors } = validate(validator, data);

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
