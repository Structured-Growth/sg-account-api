import {
	autoInjectable,
	NotFoundError,
	RepositoryInterface,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import Email, { EmailAttributes, EmailCreationAttributes } from "../../../database/models/email";
import { EmailSearchParamsInterface } from "../../interfaces/email-search-params.interface";
import { Op } from "sequelize";

@autoInjectable()
export class EmailsRepository
	implements RepositoryInterface<Email, EmailSearchParamsInterface, EmailCreationAttributes>
{
	public async search(
		params: EmailSearchParamsInterface,
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<Email>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = params.accountId);
		params.userId && (where["userId"] = params.userId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.isPrimary !== undefined && (where["isPrimary"] = params.isPrimary);
		params.id && (where["id"] = { [Op.in]: params.id });

		if (params.email?.length > 0) {
			where["email"] = {
				[Op.or]: params.email.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await Email.count({
				where,
				group: ["orgId"],
			});
			const count = countResult[0]?.count || 0;
			return {
				data: [],
				total: count,
				limit,
				page,
			};
		} else {
			const { rows, count } = await Email.findAndCountAll({
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

	public async create(params: EmailCreationAttributes): Promise<Email> {
		return Email.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Email> {
		return Email.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: Partial<EmailAttributes>): Promise<Email> {
		const email = await this.read(id);
		if (!email) {
			throw new NotFoundError(`Email ${id} not found`);
		}
		email.setAttributes(params);

		return email.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Email.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Email ${id} not found`);
		}
	}
}
