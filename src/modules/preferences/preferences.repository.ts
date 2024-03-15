import { Op, where } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Preferences, {
	PreferencesCreationAttributes,
	PreferencesUpdateAttributes,
} from "../../../database/models/preferences";
import { PreferencesSearchParamsInterface } from "../../interfaces/preferences-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class PreferencesRepository
	implements RepositoryInterface<Preferences, PreferencesSearchParamsInterface, PreferencesCreationAttributes>
{
	public async search(
		params: PreferencesSearchParamsInterface,
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<Preferences>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.accountId && (where["accountId"] = params.accountId);
		params.id && (where["id"] = { [Op.in]: params.id });

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await Preferences.count({
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
			const { rows, count } = await Preferences.findAndCountAll({
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

	public async create(params: PreferencesCreationAttributes): Promise<Preferences> {
		return Preferences.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Preferences | null> {
		return Preferences.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: PreferencesUpdateAttributes): Promise<Preferences> {
		const preferences = await this.read(id);
		if (!preferences) {
			throw new NotFoundError(`Preferences ${id} not found`);
		}
		preferences.setAttributes(omitBy(params, isUndefined));

		return preferences.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Preferences.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Preferences ${id} not found`);
		}
	}
}
