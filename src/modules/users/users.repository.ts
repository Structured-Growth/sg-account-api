import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	inject,
	I18nType,
} from "@structured-growth/microservice-sdk";
import User, { UserCreationAttributes, UserUpdateAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "../../interfaces/user-search-params.interface";
import { isUndefined, omitBy } from "lodash";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import Phone from "../../../database/models/phone";
import Email from "../../../database/models/email";
import Account from "../../../database/models/account";
import { Sequelize } from "sequelize-typescript";

@autoInjectable()
export class UsersRepository implements RepositoryInterface<User, UserSearchParamsInterface, UserCreationAttributes> {
	private i18n: I18nType;
	constructor(
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async search(
		params: UserSearchParamsInterface & {
			metadata?: Record<string, string | number>;
			accountMetadata?: Record<string, string | number>;
		},
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<User>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort
			? params.sort.map((item) => {
					let [field, order, cast] = item.split(":");
					if (cast) {
						field = field.startsWith("metadata") ? field.replace(".", "#>>'{") + "}'" : field;
						return [Sequelize.literal(`CAST("User".${field} as ${cast})`), order] as any;
					} else {
						return [field, order];
					}
			  })
			: [["createdAt", "desc"]];
		let include = [];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = { [Op.in]: params.accountId });
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.gender && (where["gender"] = { [Op.in]: params.gender });
		params.isPrimary !== undefined && (where["isPrimary"] = params.isPrimary);

		if (params.firstName?.length > 0) {
			where["firstName"] = {
				[Op.or]: params.firstName.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.lastName?.length > 0) {
			where["lastName"] = {
				[Op.or]: params.lastName.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.birthday && params.birthday.length === 2) {
			params.birthday[0] = params.birthday[0] || new Date("1900-01-01").toISOString();
			params.birthday[1] = params.birthday[1] || new Date().toISOString();
			where["birthday"] = {
				[Op.between]: params.birthday,
			};
		}

		if (params.metadata) {
			where["metadata"] = params.metadata;
		}

		if (params.accountMetadata) {
			include.push({
				model: Account,
				where: {
					metadata: params.accountMetadata,
				},
			});
		}

		if (params.search) {
			include.push({ model: Phone }, { model: Email });

			const searchValue = `%${params.search.toLowerCase()}%`;

			where[Op.or] = [
				{ id: parseInt(params.search) || 0 },
				{ accountId: parseInt(params.search) || 0 },
				{ firstName: { [Op.iLike]: searchValue } },
				{ lastName: { [Op.iLike]: searchValue } },
				{ "$phone.phone_number$": { [Op.like]: searchValue } },
				{ "$email.email$": { [Op.like]: searchValue } },
			];
		}

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await User.count({
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
			const { rows, count } = await User.findAndCountAll({
				where,
				include,
				subQuery: false,
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

	public async create(params: UserCreationAttributes): Promise<User> {
		await this.customFieldService.validate("User", params.metadata, params.orgId);
		return User.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<User> {
		return User.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: UserUpdateAttributes): Promise<User> {
		const user = await this.read(id);
		if (!user) {
			throw new NotFoundError(`${this.i18n.__("error.user.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		user.setAttributes(omitBy(params, isUndefined));
		await this.customFieldService.validate("User", user.toJSON().metadata, user.orgId);

		return user.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await User.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.user.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
