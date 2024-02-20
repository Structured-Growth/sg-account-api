import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Account, { AccountAttributes, AccountCreationAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";

@autoInjectable()
export class AccountRepository
	implements RepositoryInterface<Account, AccountSearchParamsInterface, AccountCreationAttributes>
{
	public async search(params: AccountSearchParamsInterface): Promise<SearchResultInterface<Account>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};

		if (params.status) {
			where["status"] = {
				[Op.in]: params.status,
			};
		}

		const { rows, count } = await Account.findAndCountAll({
			where,
			offset,
			limit,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: AccountCreationAttributes): Promise<Account> {
		return Account.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Account | null> {
		return Account.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: Partial<AccountAttributes>): Promise<Account> {
		const account = await this.read(id);

		if (!account) {
			throw new NotFoundError(`Account ${id} not found`);
		}

		account.setAttributes(params);
		await account.save();

		return account;
	}

	public async delete(id: number): Promise<void> {
		await Account.destroy({ where: { id } });
	}
}
