import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { genSaltSync, hashSync, compareSync } from "bcrypt";
import { Mailer } from "@structured-growth/microservice-sdk";
import Email from "../../../database/models/email";
import { EmailCreateBodyInterface } from "../../interfaces/email-create-body.interface";
import { EmailsRepository } from "./emails.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { UsersRepository } from "../users/users.repository";
import { find, isUndefined, random } from "lodash";
import { KeyValueStorageInterface } from "@structured-growth/microservice-sdk";
import { EmailUpdateBodyInterface } from "../../interfaces/email-update-body.interface";

@autoInjectable()
export class EmailsService {
	constructor(
		@inject("EmailsRepository") private emailRepository: EmailsRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("KeyValueStorage") private kvStorage: KeyValueStorageInterface,
		@inject("encryptionKey") private encryptionKey: string,
		@inject("Mailer") private mailer: Mailer,
		@inject("emailVerificationCodeLifeTimeHours") private emailVerificationCodeLifeTimeHours: number,
		@inject("emailVerificationTestCode") private emailVerificationTestCode: string
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

		const { data, total } = await this.emailRepository.search({
			orgId: account.orgId,
			accountId: [params.accountId],
		});

		if (find(data, { email: params.email })) {
			throw new ValidationError({
				email: ["Email is already taken"],
			});
		}

		const isPrimary = !find(data, { isPrimary: true });
		const { code, hash, expirationDate } = this.generateVerificationCode();

		const email = await this.emailRepository.create({
			orgId: account.orgId,
			region: account.region,
			status: "verification",
			email: params.email,
			accountId: account.id,
			userId: user.id,
			isPrimary: isPrimary,
			verificationCodeExpires: expirationDate,
			verificationCodeHash: hash,
			verificationCodeSalt: null,
			metadata: params.metadata || {},
		});

		if (params.sendVerificationCode) {
			await this.sendVerificationEmail(email.id, code);
		}

		return email;
	}

	public async update(emailId: number, params: EmailUpdateBodyInterface): Promise<Email> {
		const email = await this.emailRepository.read(emailId);
		if (!email) {
			throw new NotFoundError(`Email ${emailId} not found`);
		}

		if (params.isPrimary) {
			// mark other emails as non-primary
			const { data, total } = await this.emailRepository.search({
				orgId: email.orgId,
				accountId: [email.accountId],
			});
			await Promise.all(data.map((email) => this.emailRepository.update(email.id, { isPrimary: false })));
		} else if (!isUndefined(params.isPrimary)) {
			// check if there is at least one primary email exists
			const { data, total } = await this.emailRepository.search({
				orgId: email.orgId,
				accountId: [email.accountId],
				isPrimary: true,
			});
			if (!total || data[0].id === emailId) {
				throw new ValidationError({}, "You must have at least one primary email");
			}
		}

		return this.emailRepository.update(emailId, params);
	}

	public async sendVerificationEmail(emailId: number, code?: string) {
		const email = await this.emailRepository.read(emailId);
		if (!email) {
			throw new NotFoundError(`Email ${emailId} not found`);
		}

		let _code = code;

		if (!_code) {
			const { code, hash, expirationDate } = this.generateVerificationCode();
			_code = code;
			await this.emailRepository.update(emailId, {
				verificationCodeHash: hash,
				verificationCodeSalt: null,
				verificationCodeExpires: expirationDate,
			});
		}

		await this.mailer.send({
			toEmail: email.email,
			fromEmail: process.env.FROM_EMAIL || "support@example.com",
			subject: `Email verification`,
			html: [
				`<h1>Verification code</h1>`,
				`<p>Your verification code is below. It will expire in 24 hours.</p>`,
				`<h2>${_code}</h2>`,
				`<p>If you have any issues confirming your email we will be happy to help you. You can contact us on ${process.env.SUPPORT_EMAIL}.</p>`,
			].join(""),
		} as any);

		return email;
	}

	public async verifyEmail(emailId: number, code: string): Promise<Email> {
		const email = await this.emailRepository.read(emailId);
		if (!email) {
			throw new NotFoundError(`Email ${emailId} not found`);
		}

		const isValid = compareSync(code, email.verificationCodeHash);

		if (!isValid || new Date(email.verificationCodeExpires).getTime() < Date.now()) {
			throw new NotFoundError("Verification code not found");
		}

		return this.emailRepository.update(emailId, {
			status: "active",
			verificationCodeHash: null,
			verificationCodeSalt: null,
			verificationCodeExpires: null,
		});
	}

	private generateVerificationCode(): {
		code: string;
		hash: string;
		expirationDate: Date;
	} {
		const code = this.emailVerificationTestCode || random(100000, 999999).toString().padStart(6, "0");
		const salt = genSaltSync(2);
		const hash = hashSync(code, salt);
		const expirationDate = new Date();
		expirationDate.setHours(expirationDate.getHours() + this.emailVerificationCodeLifeTimeHours);

		return { code, hash, expirationDate };
	}
}
