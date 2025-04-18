import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
} from "@structured-growth/microservice-sdk";
import Group, { GroupCreationAttributes, GroupUpdateAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";
import { isUndefined, omitBy } from "lodash";
import GroupMember from "../../../database/models/group-member";
import { Sequelize } from "sequelize-typescript";
import { inject } from "@structured-growth/microservice-sdk";
import { CustomFieldService } from "../custom-fields/custom-field.service";

@autoInjectable()
export class GroupsRepository
	implements RepositoryInterface<Group, GroupSearchParamsInterface, GroupCreationAttributes>
{
	private i18n: I18nType;
	constructor(
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async search(
		params: GroupSearchParamsInterface & {
			metadata?: Record<string, string | number>;
		},
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<Group>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const include = [];
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.parentGroupId && (where["parentGroupId"] = params.parentGroupId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.metadata) {
			where["metadata"] = params.metadata;
		}

		if (params.accountId) {
			include.push({
				model: GroupMember,
				attributes: [],
			});
			where[Op.or] = [
				{ accountId: Number(params.accountId) },
				Sequelize.literal(`members.account_id = ${params.accountId}`),
			];
		}

		if (params.name?.length > 0) {
			where["name"] = {
				[Op.or]: params.name.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.title?.length > 0) {
			where["title"] = {
				[Op.or]: params.title.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await Group.count({
				where,
				include,
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
			const { rows, count } = await Group.findAndCountAll({
				where,
				include,
				offset,
				limit,
				order,
				distinct: true,
				subQuery: false,
			});

			return {
				data: rows,
				total: count,
				limit,
				page,
			};
		}
	}

	public async create(params: GroupCreationAttributes): Promise<Group> {
		await this.customFieldService.validate("Group", params.metadata, params.orgId);
		return Group.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Group | null> {
		return Group.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	// pick some attributes
	public async update(id: number, params: GroupUpdateAttributes): Promise<Group> {
		const group = await this.read(id);
		if (!group) {
			throw new NotFoundError(`${this.i18n.__("error.group.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		group.setAttributes(omitBy(params, isUndefined));

		return group.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Group.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.group.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
