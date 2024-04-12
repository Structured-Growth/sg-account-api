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

@autoInjectable()
export class CustomFieldService {
	constructor(
		@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository
	) {}

	public async create(data: CustomFieldCreateBodyInterface): Promise<CustomField> {
		let region = RegionEnum.US;
		if (data.orgId) {
			const organization = await this.organizationRepository.read(data.orgId);

			if (!organization) {
				throw new NotFoundError(`Organization ${data.orgId} not found`);
			}
			region = organization.region;
		}

		return this.customFieldRepository.create({
			...data,
			region,
			status: data.status || "active",
		});
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
		const customFields = await CustomField.findAll({
			where: {
				entity: entityName,
				orgId: {
					[Op.or]: [null, orgId || null],
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
			throw new ValidationError(errors);
		}

		return { valid, message, errors };
	}
}
