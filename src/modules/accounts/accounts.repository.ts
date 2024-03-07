import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Account, { AccountAttributes, AccountCreationAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";
import { AccountUpdateBodyInterface } from "../../interfaces/account-update-body.interface";

@autoInjectable()
export class AccountRepository
	implements RepositoryInterface<Account, AccountSearchParamsInterface, AccountCreationAttributes>
{
	public async search(params: AccountSearchParamsInterface): Promise<SearchResultInterface<Account>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });

		// TODO search by arn with wildcards

		const { rows, count } = await Account.findAndCountAll({
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

	public async update(id: number, params: AccountUpdateBodyInterface): Promise<Account> {
		const account = await this.read(id);

		if (!account) {
			throw new NotFoundError(`Account ${id} not found`);
		}
		account.setAttributes(params);

		return account.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Account.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Account ${id} not found`);
		}
	}
}
