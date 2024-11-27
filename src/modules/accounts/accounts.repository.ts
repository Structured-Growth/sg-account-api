import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	inject,
} from "@structured-growth/microservice-sdk";
import Account, { AccountAttributes, AccountCreationAttributes } from "../../../database/models/account";
import { AccountSearchParamsInterface } from "../../interfaces/account-search-params.interface";
import { AccountUpdateBodyInterface } from "../../interfaces/account-update-body.interface";
import { CustomFieldService } from "../custom-fields/custom-field.service";

@autoInjectable()
export class AccountRepository
	implements RepositoryInterface<Account, AccountSearchParamsInterface, AccountCreationAttributes>
{
	constructor(@inject("CustomFieldService") private customFieldService: CustomFieldService) {}

	public async search(
		params: AccountSearchParamsInterface & {
			metadata?: Record<string, string | number>;
		}
	): Promise<SearchResultInterface<Account>> {
		const page = Number(params.page || 1);
		const limit = Number(params.limit || 20);
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });

		if (params.metadata) {
			where["metadata"] = params.metadata;
		}

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
		await this.customFieldService.validate("Account", params.metadata, params.orgId);
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
		await this.customFieldService.validate("Account", account.toJSON().metadata, account.orgId);

		return account.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Account.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Account ${id} not found`);
		}
	}
}
