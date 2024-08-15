import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import CustomField, { CustomFieldCreationAttributes } from "../../../database/models/custom-field";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { CustomFieldUpdateBodyInterface } from "../../interfaces/custom-field-update-body.interface";

@autoInjectable()
export class CustomFieldRepository
	implements
		RepositoryInterface<
			CustomField,
			Omit<CustomFieldSearchParamsInterface, "includeInherited" | "orgId"> & {
				orgId: number[];
			},
			CustomFieldCreationAttributes
		>
{
	public async search(
		params: Omit<CustomFieldSearchParamsInterface, "includeInherited" | "orgId"> & {
			orgId: number[];
		}
	): Promise<SearchResultInterface<CustomField>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = { [Op.in]: params.orgId });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.entity && (where["entity"] = { [Op.in]: params.entity });
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.title?.length > 0) {
			where["title"] = {
				[Op.or]: params.title.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.name?.length > 0) {
			where["name"] = {
				[Op.or]: params.name.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		// TODO search by arn with wildcards

		const { rows, count } = await CustomField.findAndCountAll({
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

	public async create(params: CustomFieldCreationAttributes): Promise<CustomField> {
		return CustomField.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<CustomField | null> {
		return CustomField.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: CustomFieldUpdateBodyInterface): Promise<CustomField> {
		const model = await this.read(id);

		if (!model) {
			throw new NotFoundError(`CustomField ${id} not found`);
		}
		model.setAttributes(params);

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await CustomField.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`CustomField ${id} not found`);
		}
	}
}
