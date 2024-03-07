import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Organization, {
	OrganizationCreationAttributes,
	OrganizationUpdateAttributes,
} from "../../../database/models/organization";
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
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.parentOrgId && (where["parentOrgId"] = params.parentOrgId);
		params.status && (where["status"] = { [Op.in]: params.status });
		params.id && (where["id"] = { [Op.in]: params.id });

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
	public async update(id: number, params: OrganizationUpdateAttributes): Promise<Organization> {
		const organization = await this.read(id);
		organization.setAttributes(params);

		return organization.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Organization.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Organization ${id} not found`);
		}
	}
}
