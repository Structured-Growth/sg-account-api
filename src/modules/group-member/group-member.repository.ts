import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	inject,
} from "@structured-growth/microservice-sdk";
import GroupMember, {
	GroupMemberCreationAttributes,
	GroupMemberUpdateAttributes,
} from "../../../database/models/group-member";
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";
import { isUndefined, omitBy } from "lodash";
import { CustomFieldService } from "../custom-fields/custom-field.service";

@autoInjectable()
export class GroupMemberRepository
	implements RepositoryInterface<GroupMember, GroupMemberSearchParamsInterface, GroupMemberCreationAttributes>
{
	constructor(@inject("CustomFieldService") private customFieldService: CustomFieldService) {}

	public async search(
		params: GroupMemberSearchParamsInterface & { groupId: number; metadata?: Record<string, string | number> },
		options?: {
			onlyTotal: boolean;
		}
	): Promise<SearchResultInterface<GroupMember>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.id && (where["id"] = { [Op.in]: params.id });
		params.groupId && (where["groupId"] = params.groupId);
		params.accountId && (where["accountId"] = params.accountId);
		params.userId && (where["userId"] = { [Op.in]: params.userId });
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.metadata) {
			where["metadata"] = params.metadata;
		}

		// TODO search by arn with wildcards

		if (options?.onlyTotal) {
			const countResult = await GroupMember.count({
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
			const { rows, count } = await GroupMember.findAndCountAll({
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

	public async create(params: GroupMemberCreationAttributes): Promise<GroupMember> {
		await this.customFieldService.validate("GroupMember", params.metadata, params.orgId);
		return GroupMember.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<GroupMember | null> {
		return GroupMember.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: GroupMemberUpdateAttributes): Promise<GroupMember> {
		const groupMember = await this.read(id);
		if (!groupMember) {
			throw new NotFoundError(`Group member ${id} not found`);
		}
		groupMember.setAttributes(omitBy(params, isUndefined));
		await this.customFieldService.validate("GroupMember", groupMember.toJSON().metadata, groupMember.orgId);

		return groupMember.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await GroupMember.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Group member ${id} not found`);
		}
	}
}
