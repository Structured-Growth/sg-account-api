import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	inject,
} from "@structured-growth/microservice-sdk";
import Phone, { PhoneAttributes, PhoneCreationAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "../../interfaces/phone-search-params.interface";
import { Op } from "sequelize";
import { NotFoundError } from "@structured-growth/microservice-sdk";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class PhonesRepository
	implements RepositoryInterface<Phone, PhoneSearchParamsInterface, PhoneCreationAttributes>
{
	constructor(@inject("CustomFieldService") private customFieldService: CustomFieldService) {}

	public async search(
		params: PhoneSearchParamsInterface & {
			metadata?: Record<string, string | number>;
		},
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<Phone>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = { [Op.in]: params.accountId });
		params.userId && (where["userId"] = { [Op.in]: params.userId });
		params.status && (where["status"] = { [Op.in]: params.status });
		params.isPrimary !== undefined && (where["isPrimary"] = params.isPrimary);
		params.id && (where["id"] = { [Op.in]: params.id });

		if (params.phoneNumber?.length > 0) {
			where["phoneNumber"] = {
				[Op.or]: params.phoneNumber.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.metadata) {
			where["metadata"] = params.metadata;
		}

		if (options?.onlyTotal) {
			const countResult = await Phone.count({
				where,
				group: [],
			});
			const count = countResult[0]?.count || 0;
			return {
				data: [],
				total: count,
				limit,
				page,
			};
		} else {
			const { rows, count } = await Phone.findAndCountAll({
				where,
				offset,
				limit,
				order,
			});

			return {
				data: rows,
				total: count,
				limit,
				page,
			};
		}
	}

	public async create(params: PhoneCreationAttributes): Promise<Phone> {
		await this.customFieldService.validate("Phone", params.metadata, params.orgId);
		return Phone.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Phone | null> {
		return Phone.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: Partial<PhoneAttributes>): Promise<Phone> {
		const phone = await this.read(id);
		if (!phone) {
			throw new NotFoundError(`Phone ${id} not found`);
		}
		phone.setAttributes(omitBy(params, isUndefined));
		await this.customFieldService.validate("Phone", phone.toJSON().metadata, phone.orgId);

		return phone.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Phone.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Phone ${id} not found`);
		}
	}
}
