import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Organization, {
	OrganizationAttributes,
	OrganizationCreationAttributes,
} from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "../../controllers/v1/interfaces/organization-search-params.interface";

@autoInjectable()
export class OrganizationRepository
	implements RepositoryInterface<Organization, OrganizationSearchParamsInterface, OrganizationCreationAttributes>
{
	public async search(params: OrganizationSearchParamsInterface): Promise<SearchResultInterface<Organization>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const where = {};

		if (params.name) {
			where["name"] = params.name;
		}

		const { rows, count } = await Organization.findAndCountAll({
			where,
			limit,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: any): Promise<Organization> {
		return Promise.resolve(undefined);
	}

	public async read(id: number): Promise<Organization> {
		return Promise.resolve(undefined);
	}

	public async update(id: number, params: Partial<any>): Promise<Organization> {
		return Promise.resolve(undefined);
	}

	public async delete(id: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
