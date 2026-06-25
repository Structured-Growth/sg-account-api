import {
	autoInjectable,
	inject,
	NotFoundError,
	I18nType,
	Emits,
	EventbusService,
} from "@structured-growth/microservice-sdk";
import Account, { AccountAttributes } from "../../../database/models/account";
import { AccountCreateBodyInterface } from "../../interfaces/account-create-body.interface";
import { AccountRepository } from "./accounts.repository";
import { OrganizationRepository } from "../organizations/organization.repository";

@autoInjectable()
export class AccountsService {
	private i18n: I18nType;
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository,
		@inject("EventbusService") private eventBus: EventbusService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	@Emits<AccountAttributes>("events/accounts/created", [Account])
	public async create(params: AccountCreateBodyInterface): Promise<Account> {
		const organization = await this.organizationRepository.read(params.orgId);

		if (!organization) {
			throw new NotFoundError(
				`${this.i18n.__("error.organization.name")} ${params.orgId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const account = await this.accountRepository.create({
			orgId: organization.id,
			region: organization.region,
			status: params.status || "inactive",
			metadata: params.metadata || {},
		});

		await this.eventBus.publish({
			arn: `events/account/created`,
			data: account.toJSON(),
			resources: [account.arn],
		});

		return account;
	}
}
