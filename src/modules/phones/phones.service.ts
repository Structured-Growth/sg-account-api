import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { KeyValueStorageInterface } from "@structured-growth/microservice-sdk";
import { SmsService } from "@structured-growth/microservice-sdk";
import Phone, { PhoneAttributes } from "../../../database/models/phone";
import { PhoneCreateBodyInterface } from "../../interfaces/phone-create-body.interface";
import { PhoneUpdateBodyInterface } from "../../interfaces/phone-update-body.interface";
import { PhonesRepository } from "./phones.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { UsersRepository } from "../users/users.repository";
import { find, isUndefined, omitBy, random } from "lodash";

@autoInjectable()
export class PhonesService {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("PhonesRepository") private phonesRepository: PhonesRepository,
		@inject("KeyValueStorage") private kvStorage: KeyValueStorageInterface,
		@inject("encryptionKey") private encryptionKey: string,
		@inject("SmsService") private smsService: SmsService,
		@inject("phoneVerificationCodeLifeTimeHours") private phoneVerificationCodeLifeTimeHours: number,
		@inject("phoneVerificationTestCode") private phoneVerificationTestCode: string
	) {}

	public async create(params: PhoneCreateBodyInterface): Promise<Phone> {
		const [account, user] = await Promise.all([
			this.accountRepository.read(params.accountId),
			this.userRepository.read(params.userId),
		]);

		const { data, total } = await this.phonesRepository.search({
			orgId: account.orgId,
			accountId: params.accountId,
		});

		if (find(data, { phoneNumber: params.phoneNumber })) {
			throw new ValidationError({
				phoneNumber: ["Phone number is already taken"],
			});
		}

		const isPrimary = !find(data, { isPrimary: true });
		const { code, hash, expirationDate } = this.generateVerificationCode();

		const phone = await this.phonesRepository.create({
			orgId: account.orgId,
			region: account.region,
			status: "verification",
			phoneNumber: params.phoneNumber,
			accountId: account.id,
			userId: user.id,
			isPrimary: isPrimary,
			verificationCodeExpires: expirationDate,
			verificationCodeHash: hash,
			verificationCodeSalt: null,
			metadata: params.metadata || {},
		});

		if (params.sendVerificationCode) {
			await this.sendVerificationCode(phone.id, code);
		}

		return phone;
	}

	public async update(phoneId: number, params: PhoneUpdateBodyInterface): Promise<Phone> {
		const phone = await this.phonesRepository.read(phoneId);
		if (!phone) {
			throw new NotFoundError(`Phone ${phoneId} not found`);
		}

		if (params.isPrimary) {
			// mark other emails as non-primary
			const { data, total } = await this.phonesRepository.search({
				orgId: phone.orgId,
				accountId: phone.accountId,
			});
			await Promise.all(data.map((phone) => this.phonesRepository.update(phone.id, { isPrimary: false })));
		} else if (!isUndefined(params.isPrimary)) {
			// check if there is at least one primary email exists
			const { data, total } = await this.phonesRepository.search({
				orgId: phone.orgId,
				accountId: phone.accountId,
				isPrimary: true,
			});
			if (!total || data[0].id === phoneId) {
				throw new ValidationError({}, "You must have at least one primary phone number");
			}
		}

		return this.phonesRepository.update(phoneId, params);
	}

	public async sendVerificationCode(phoneId: number, code?: string) {
		const phone = await this.phonesRepository.read(phoneId);
		if (!phone) {
			throw new NotFoundError(`Phone ${phoneId} not found`);
		}

		let _code = code;

		if (!_code) {
			const { code, hash, expirationDate } = this.generateVerificationCode();
			_code = code;
			await this.phonesRepository.update(phoneId, {
				verificationCodeHash: hash,
				verificationCodeSalt: null,
				verificationCodeExpires: expirationDate,
			});
		}

		await this.smsService.send(phone.phoneNumber, `Verification code: ${_code}`);

		return phone;
	}

	public async verifyPhone(phoneId: number, code: string): Promise<Phone> {
		const phone = await this.phonesRepository.read(phoneId);
		if (!phone) {
			throw new NotFoundError(`Phone ${phoneId} not found`);
		}

		const isValid = compareSync(code, phone.verificationCodeHash);

		if (!isValid || new Date(phone.verificationCodeExpires).getTime() < Date.now()) {
			throw new NotFoundError("The validation code has expired or could not be found");
		}

		return this.phonesRepository.update(phoneId, {
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
		const code = this.phoneVerificationTestCode || random(100000, 999999).toString().padStart(6, "0");
		const salt = genSaltSync(2);
		const hash = hashSync(code, salt);
		const expirationDate = new Date();
		expirationDate.setHours(expirationDate.getHours() + this.phoneVerificationCodeLifeTimeHours);

		return { code, hash, expirationDate };
	}
}
