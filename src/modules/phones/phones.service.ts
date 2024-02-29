import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Phone, { PhoneAttributes } from "../../../database/models/phone";
import { PhoneCreateBodyInterface } from "../../interfaces/phone-create-body.interface";
import { PhoneUpdateBodyInterface } from "../../interfaces/phone-update-body.interface";
import { PhonesRepository } from "./phones.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { UsersRepository } from "../users/users.repository";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class PhonesService {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("PhonesRepository") private phonesRepository: PhonesRepository,
	) {
	}

	public async create(params: PhoneCreateBodyInterface): Promise<Phone> {
		const account = await this.accountRepository.read(params.accountId);
		if (!account) {
			throw new NotFoundError(`Account ${params.accountId} not found`);
		}
		const user = await this.userRepository.read(params.userId);
		if (!user) {
			throw new NotFoundError(`User ${params.userId} not found`);
		}

		return undefined;
		//this.phonesRepository.create({
		//	orgId: account.orgId,
		//	region: account.region,
		//	accountId: params.accountId,
		//	userId: params.userId
		//	phoneNumber: params.phoneNumber
		//});
	}

	public async update(id, params: PhoneUpdateBodyInterface): Promise<Phone> {
		return undefined;
	}
}
