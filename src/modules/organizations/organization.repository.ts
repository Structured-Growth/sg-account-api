import { autoInjectable, RepositoryInterface, SearchResultInterface, NotFoundError } from "@structured-growth/microservice-sdk";
import Organization, { OrganizationCreationAttributes } from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "../../interfaces/organization-search-params.interface";

@autoInjectable()
export class OrganizationRepository
	implements RepositoryInterface<Organization, OrganizationSearchParamsInterface, OrganizationCreationAttributes>
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
		return Organization.create(params);
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
		const Organization = await this.read(id);

		if (!Organization) {
			throw new NotFoundError(`Organization ${id} not found`);
		}

		Organization.setAttributes(params);
		await Organization.save();

		return Organization;
	}

	public async delete(id: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
