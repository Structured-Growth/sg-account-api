import { autoInjectable, inject, NotFoundError } from "@structured-growth/microservice-sdk";
import User from "../../../database/models/user";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UsersRepository } from "./users.repository";
import { AccountRepository } from "../accounts/accounts.repository";

@autoInjectable()
export class UsersService {
	constructor(
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository
	) {}

	public async create(params: UserCreateBodyInterface): Promise<User> {
		const account = await this.accountRepository.read(params.accountId, {
			attributes: ["id", "orgId"],
		});

		if (!account) {
			throw new NotFoundError(`Account ${params.accountId} not found`);
		}

		const organization = await account.$get("org", {
			attributes: ["id", "region"],
		});

		// todo: upload image and get imageUuid

		// todo: check if account doesn't have users yet set isPrimary true, otherwise - false

		return this.userRepository.create({
			orgId: organization.id,
			region: organization.region,
			accountId: account.id,
			firstName: params.firstName,
			lastName: params.lastName,
			birthday: params.birthday,
			gender: params.gender,
			imageUuid: null,
			isPrimary: true,
			status: params.status || "active",
		});
	}
}
