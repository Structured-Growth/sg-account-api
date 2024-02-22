import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Organization, { OrganizationCreationAttributes } from "../../../database/models/organization";
import { OrganizationSearchParamsInterface } from "../../interfaces/organization-search-params.interface";
import { Op } from "sequelize";

@autoInjectable()
export class OrganizationRepository
	implements RepositoryInterface<Organization, OrganizationSearchParamsInterface, OrganizationCreationAttributes>
{
	public async search(params: OrganizationSearchParamsInterface): Promise<SearchResultInterface<Organization>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? params.sort.map((item) => item.split(":")) : [["createdAt", "desc"]];

		params.parentOrgId && (where["parentOrgId"] = params.parentOrgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });

		if (params.name?.length > 0) {
			where["name"] = {
				[Op.or]: [params.name.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		if (params.title?.length > 0) {
			where["title"] = {
				[Op.or]: [params.title.map((str) => ({ [Op.iLike]: str }))],
			};
		}

		// TODO search by arn with wildcards

		const { rows, count } = await Organization.findAndCountAll({
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
		const organization = await this.read(id);

		if (!organization) {
			throw new NotFoundError(`Organization ${id} not found`);
		}

		organization.setAttributes(params);

		return organization.save();
	}

	public async delete(id: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
