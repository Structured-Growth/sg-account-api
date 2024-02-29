import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Phone, { PhoneCreationAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "../../interfaces/phone-search-params.interface";
import { Op } from "sequelize";
import { NotFoundError } from "@structured-growth/microservice-sdk/.dist";

@autoInjectable()
export class PhonesRepository
	implements RepositoryInterface<Phone, PhoneSearchParamsInterface, PhoneCreationAttributes>
{
	public async search(params: PhoneSearchParamsInterface): Promise<SearchResultInterface<Phone>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.isPrimary !== undefined && (where["isPrimary"] = params.isPrimary);
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.phoneNumber?.length > 0) {
			where["phoneNumber"] = {
				[Op.or]: [params.phoneNumber.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		if (params.userId?.length > 0) {
			where["userId"] = {
				[Op.or]: [params.userId.map((str) => ({ [Op.iLike]: str }))],
			};
		}

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

	public async create(params: PhoneCreationAttributes): Promise<Phone> {
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

	// pick some attributes
	public async update(id: number, params: Partial<any>): Promise<Phone> {
		const phone = await this.read(id);
		phone.setAttributes(params);

		return phone.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Phone.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Phone ${id} not found`);
		}
	}
}
