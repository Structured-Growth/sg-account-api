import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import User, { UserUpdateAttributes } from "../../../database/models/user";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "../../interfaces/user-update-body.interface";
import { UsersRepository } from "./users.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy } from "lodash";
import { PhonesRepository } from "../phones/phones.repository";
import { EmailsRepository } from "../emails/emails.repository";

@autoInjectable()
export class UsersService {
	private i18n: I18nType;
	constructor(
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator,
		@inject("EmailsRepository") private emailsRepository: EmailsRepository,
		@inject("PhonesRepository") private phonesRepository: PhonesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: UserCreateBodyInterface): Promise<User> {
		const account = await this.accountRepository.read(params.accountId, {
			attributes: ["id", "orgId"],
		});

		if (!account) {
			throw new NotFoundError(
				`${this.i18n.__("error.account.name")} ${params.accountId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const organization = await account.$get("org", {
			attributes: ["id", "region"],
		});

		let imageUuid = null;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: this.i18n.__("error.user.invalid_image_file"),
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		const { total } = await this.userRepository.search(
			{
				orgId: organization.id,
				accountId: [params.accountId],
			},
			{
				onlyTotal: true,
			}
		);
		const isPrimary = total === 0;

		return this.userRepository.create({
			orgId: organization.id,
			region: organization.region,
			accountId: params.accountId,
			firstName: params.firstName,
			lastName: params.lastName,
			birthday: params.birthday,
			gender: params.gender,
			status: params.status || "inactive",
			imageUuid: imageUuid || null,
			metadata: params.metadata || {},
			isPrimary,
		});
	}

	public async update(userId, params: UserUpdateBodyInterface): Promise<User> {
		const checkUser = await this.userRepository.read(userId, { attributes: ["id"] });
		if (!checkUser) {
			throw new NotFoundError(`${this.i18n.__("error.user.name")} ${userId} ${this.i18n.__("error.common.not_found")}`);
		}

		let imageUuid = null;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: this.i18n.__("error.user.invalid_image_file"),
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		if (params.isPrimary) {
			// mark other users as non-primary
			const { data, total } = await this.userRepository.search({
				orgId: checkUser.orgId,
				accountId: [checkUser.accountId],
			});
			await Promise.all(data.map((user) => this.userRepository.update(user.id, { isPrimary: false })));
		} else if (!isUndefined(params.isPrimary)) {
			// check if there is at least one primary user exists
			const { data, total } = await this.userRepository.search({
				orgId: checkUser.orgId,
				accountId: [checkUser.accountId],
				isPrimary: true,
			});
			if (!total || data[0].id === userId) {
				throw new ValidationError({}, this.i18n.__("error.user.one_primary_user"));
			}
		}

		return this.userRepository.update(
			userId,
			omitBy(
				{
					firstName: params.firstName,
					lastName: params.lastName,
					birthday: params.birthday,
					gender: params.gender,
					imageUuid: imageUuid || null,
					isPrimary: params.isPrimary,
					status: params.status,
					metadata: params.metadata,
				},
				isUndefined
			) as UserUpdateAttributes
		);
	}
}
