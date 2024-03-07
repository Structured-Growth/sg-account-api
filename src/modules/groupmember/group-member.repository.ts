import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import GroupMember, { GroupMemberCreationAttributes, GroupMemberUpdateAttributes } from "../../../database/models/group-member";
import { GroupMemberSearchParamsInterface } from "../../interfaces/group-member-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class GroupMemberRepository
	implements RepositoryInterface<GroupMember, GroupMemberSearchParamsInterface, GroupMemberCreationAttributes>
{
	public async search(params: GroupMemberSearchParamsInterface): Promise<SearchResultInterface<GroupMember>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.groupId && (where["groupId"] = params.groupId);
		params.userId && (where["userId"] = params.userId);
		params.status && (where["status"] = { [Op.in]: params.status });

		// TODO search by arn with wildcards

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

	public async create(params: GroupMemberCreationAttributes): Promise<GroupMember> {
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

	// pick some attributes
	public async update(id: number, params: GroupMemberUpdateAttributes): Promise<GroupMember> {
		const groupMember = await this.read(id);
		if (!groupMember) {
			throw new NotFoundError(`Group member ${id} not found`);
		}
		groupMember.setAttributes(omitBy(params, isUndefined));

		return groupMember.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await GroupMember.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Group member ${id} not found`);
		}
	}
}
