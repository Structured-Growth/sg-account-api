import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Group, { GroupCreationAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";

@autoInjectable()
export class GroupsRepository
	implements RepositoryInterface<Group, GroupSearchParamsInterface, GroupCreationAttributes>
{
	public async search(params: OrganizationSearchParamsInterface): Promise<SearchResultInterface<Organization>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};

		if (params.name) {
			where["name"] = params.name;
		}

		const { rows, count } = await Organization.findAndCountAll({
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

	public async create(params: OrganizationCreationAttributes): Promise<Organization> {
		return Promise.resolve(undefined);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Organization | null> {
		return Organization.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}
// pick some attributes
	public async update(id: number, params: Partial<any>): Promise<Organization> {
		return Promise.resolve(undefined);
	}

	public async delete(id: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}