import { Op } from "sequelize";
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
	public async search(params: UserSearchParamsInterface): Promise<SearchResultInterface<User>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.accountId && (where["accountId"] = params.accountId);
		params.orgId && (where["orgId"] = params.orgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });

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

		if (params.birthday) {
			if (params.birthday.length === 1) {
				// Single date for exact search
				where["birthday"] = {
					[Op.eq]: params.birthday[0],
				};
			} else if (params.birthday.length === 2) {
				// Range search
				where["birthday"] = {
					[Op.between]: params.birthday,
				};
			}
		}

		if (params.gender) {
			if (params.gender.length === 1) {
				// Single value
				where["gender"] = params.gender[0];
			} else if (params.gender.length === 2) {
				// Range search
				where["gender"] = {
					[Op.between]: params.gender,
				};
			}
		}

		if (params.isPrimary !== undefined) {
    		where["isPrimary"] = params.isPrimary;
		}

		// TODO search by arn with wildcards

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
		await User.destroy({ where: { id } });
	}
}
