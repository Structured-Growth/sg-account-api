import { autoInjectable, inject, NotFoundError, I18nType } from "@structured-growth/microservice-sdk";
import Account from "../../../database/models/account";
import { AccountCreateBodyInterface } from "../../interfaces/account-create-body.interface";
import { AccountRepository } from "./accounts.repository";
import { OrganizationRepository } from "../organizations/organization.repository";

@autoInjectable()
export class AccountsService {
	private i18n: I18nType;
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: AccountCreateBodyInterface): Promise<Account> {
		const organization = await this.organizationRepository.read(params.orgId);

		if (!organization) {
			throw new NotFoundError(
				`${this.i18n.__("error.organization.name")} ${params.orgId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return this.accountRepository.create({
			orgId: organization.id,
			region: organization.region,
			status: params.status || "inactive",
			metadata: params.metadata || {},
		});
	}
}
