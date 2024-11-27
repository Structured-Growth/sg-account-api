import { Op, Order, Sequelize, where } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	inject,
} from "@structured-growth/microservice-sdk";
import User, { UserCreationAttributes, UserUpdateAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "../../interfaces/user-search-params.interface";
import { isUndefined, omitBy } from "lodash";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import Phone from "../../../database/models/phone";
import Email from "../../../database/models/email";
import Account from "../../../database/models/account";

@autoInjectable()
export class UsersRepository implements RepositoryInterface<User, UserSearchParamsInterface, UserCreationAttributes> {
	constructor(@inject("CustomFieldService") private customFieldService: CustomFieldService) {}

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
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];
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
			throw new NotFoundError(`User ${id} not found`);
		}
		user.setAttributes(omitBy(params, isUndefined));
		await this.customFieldService.validate("User", user.toJSON().metadata, user.orgId);

		return user.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await User.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`User ${id} not found`);
		}
	}
}
