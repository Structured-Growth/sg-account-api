import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Email, { EmailCreationAttributes } from "../../../database/models/email";
import { EmailSearchParamsInterface } from "../../interfaces/email-search-params.interface";

@autoInjectable()
export class EmailsRepository
	implements RepositoryInterface<Email, EmailSearchParamsInterface, EmailCreationAttributes>
{
	public async search(params: EmailSearchParamsInterface): Promise<SearchResultInterface<Email>> {
		return Promise.resolve(undefined);
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

	public async update(id: number, params: Partial<any>): Promise<Email> {
		return Promise.resolve(undefined);
	}

	public async delete(id: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
