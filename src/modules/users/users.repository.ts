import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import User, { UserAttributes, UserCreationAttributes } from "../../../database/models/user";
import { UserSearchParamsInterface } from "../../interfaces/user-search-params.interface";

@autoInjectable()
export class UsersRepository implements RepositoryInterface<User, UserSearchParamsInterface, UserCreationAttributes> {
	public async search(params: UserSearchParamsInterface): Promise<SearchResultInterface<User>> {
		return Promise.resolve(undefined);
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

	public async update(id: number, params: Partial<UserAttributes>): Promise<User> {
		const user = await this.read(id);

		if (!user) {
			throw new NotFoundError(`User ${id} not found`);
		}

		user.setAttributes(params);
		await user.save();

		return user;
	}

	public async delete(id: number): Promise<void> {
		await User.destroy({ where: { id } });
	}
}
