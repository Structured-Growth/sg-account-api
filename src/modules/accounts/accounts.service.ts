import { autoInjectable, inject, NotFoundError } from "@structured-growth/microservice-sdk";
import Account from "../../../database/models/account";
import { AccountCreateBodyInterface } from "../../interfaces/account-create-body.interface";
import { AccountRepository } from "./accounts.repository";
import { OrganizationRepository } from "../organizations/organization.repository";

@autoInjectable()
export class AccountsService {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository
	) {}

	public async create(params: AccountCreateBodyInterface): Promise<Account> {
		const organization = await this.organizationRepository.read(params.orgId);

		if (!organization) {
			throw new NotFoundError(`Organization ${params.orgId} not found`);
		}

		return this.accountRepository.create({
			orgId: organization.id,
			region: organization.region,
			status: params.status || "inactive",
		});
	}
}
