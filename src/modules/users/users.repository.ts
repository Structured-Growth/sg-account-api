import { Op, where } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import User, { UserAttributes, UserCreationAttributes, UserUpdateAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "../../interfaces/user-search-params.interface";

@autoInjectable()
export class UsersRepository implements RepositoryInterface<User, UserSearchParamsInterface, UserCreationAttributes> {
	public async search(
		params: UserSearchParamsInterface,
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<User>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = params.accountId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.gender && (where["gender"] = { [Op.in]: params.gender });
		params.isPrimary !== undefined && (where["isPrimary"] = params.isPrimary);

		if (params.firstName?.length > 0) {
			where["firstName"] = {
				[Op.or]: [params.firstName.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		if (params.lastName?.length > 0) {
			where["lastName"] = {
				[Op.or]: [params.lastName.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		if (params.birthday && params.birthday.length === 2) {
			params.birthday[0] = params.birthday[0] || new Date("1900-01-01").toISOString();
			params.birthday[1] = params.birthday[1] || new Date().toISOString();
			where["birthday"] = {
				[Op.between]: params.birthday,
			};
		}

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await User.count({
				where,
				group: ["id"],
			});
			// todo
			const count = 0;
			return {
				data: [],
				total: count,
				limit,
				page,
			};
		} else {
			const { rows, count } = await User.findAndCountAll({
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

	public async create(params: UserCreationAttributes): Promise<User> {
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
		user.setAttributes(params);

		return user;
	}

	public async delete(id: number): Promise<void> {
		const n = await User.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`User ${id} not found`);
		}
	}
}
