import { autoInjectable, inject, NotFoundError } from "@structured-growth/microservice-sdk";
import Email from "../../../database/models/email";
import { EmailCreateBodyInterface } from "../../interfaces/email-create-body.interface";
import { EmailsRepository } from "./emails.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { UsersRepository } from "../users/users.repository";

@autoInjectable()
export class EmailsService {
	constructor(
		@inject("EmailsRepository") private emailRepository: EmailsRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("UsersRepository") private userRepository: UsersRepository
	) {}

	public async create(params: EmailCreateBodyInterface): Promise<Email> {
		const [account, user] = await Promise.all([
			this.accountRepository.read(params.accountId),
			this.userRepository.read(params.userId),
		]);

		if (!account) {
			throw new NotFoundError(`Account ${params.accountId} not found`);
		}

		if (!user) {
			throw new NotFoundError(`User ${params.userId} not found`);
		}

		// todo: check if account doesn't have emails yet set isPrimary true, otherwise - false

		return this.emailRepository.create({
			orgId: account.orgId,
			region: account.region,
			status: "verification",
			email: params.email,
			accountId: account.id,
			userId: user.id,
			isPrimary: true,
			verificationCodeExpires: new Date(), // todo
			verificationCodeHash: "#", // todo
			verificationCodeSalt: "#", // todo
		});
	}
}
