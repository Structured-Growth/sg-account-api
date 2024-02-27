import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Group, { GroupCreationAttributes, GroupUpdateAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";

@autoInjectable()
export class GroupsRepository
	implements RepositoryInterface<Group, GroupSearchParamsInterface, GroupCreationAttributes>
{
	public async search(params: GroupSearchParamsInterface): Promise<SearchResultInterface<Group>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = params.accountId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.parentGroupId && (where["parentGroupId"] = { [Op.in]: params.parentGroupId });
		params.status && (where["status"] = { [Op.in]: params.status });

		// TODO search by arn with wildcards

		if (params.title?.length > 0) {
			where["firstName"] = {
				[Op.or]: [params.title.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		if (params.name?.length > 0) {
			where["lastName"] = {
				[Op.or]: [params.name.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		const { rows, count } = await Group.findAndCountAll({
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

	public async create(params: GroupCreationAttributes): Promise<Group> {
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
		group.setAttributes(params);

		return group;
	}

	public async delete(id: number): Promise<void> {
		const n = await Group.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Group ${id} not found`);
		}
	}
}
