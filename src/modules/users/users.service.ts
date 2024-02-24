import slug from "slug";
import { Buffer } from "buffer";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import User, { UserUpdateAttributes } from "../../../database/models/user";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "../../interfaces/user-update-body.interface";
import { UsersRepository } from "./users.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import Account from "../../../database/models/account";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class UsersService {
	constructor(
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator
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

		let imageUuid = null;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: "Invalid image file",
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		const { total } = await this.userRepository.search(
			{
				orgId: organization.id,
				accountId: params.accountId,
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
			isPrimary,
		});
	}

	public async update(userId, params: UserUpdateBodyInterface): Promise<User> {
		const checkUser = await this.userRepository.read(userId, { attributes: ["id"] });
		if (!checkUser) {
			throw new NotFoundError(`User ${userId} not found`);
		}

		let imageUuid = null;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: "Invalid image file",
				});
			}
			// imageUuid = v4();
			// todo store image to S3 bucket
		}

		/**
		 * TODO:
		 * If isPrimary is false check if account has at least one primary user
		 * If isPrimary is true set other users' isPrimary to false
		 */

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
					status: params.status || "inactive",
				},
				isUndefined
			) as UserUpdateAttributes
		);
	}
}
