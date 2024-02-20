import {
	autoInjectable,
	NotFoundError,
	RepositoryInterface,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import Email, { EmailAttributes, EmailCreationAttributes } from "../../../database/models/email";
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

	public async update(id: number, params: Partial<EmailAttributes>): Promise<Email> {
		const email = await this.read(id);

		if (!email) {
			throw new NotFoundError(`Email ${id} not found`);
		}

		email.setAttributes(params);
		await email.save();

		return email;
	}

	public async delete(id: number): Promise<void> {
		await Email.destroy({ where: { id } });
	}
}
