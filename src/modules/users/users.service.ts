import slug from "slug";
import { Buffer } from "buffer";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import User from "../../../database/models/user";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "../../interfaces/user-update-body.interface";
import { UsersRepository } from "./users.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";

declare class Account {
	static getUsers(accountId: number): Promise<User[]>;
  }

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
		// todo: check if account doesn't have users yet set isPrimary true, otherwise - false
		const users = await Account.getUsers(params.accountId);
		const isPrimary = users.length === 0;

		return this.userRepository.create({
			orgId: organization.id,
			region: organization.region,
			accountId: params.accountId,
			firstName: params.firstName,
			lastName: params.lastName,
			birthday: params.birthday,
			gender: params.gender,
			imageUuid: imageUuid || null,
			isPrimary: true,
			status: params.status || "inactive",
		});
	}

	public async update(userId, params: UserUpdateBodyInterface): Promise<User> {

		const checkOrg = await this.userRepository.read(userId);
		if (!checkOrg) {
			throw new NotFoundError(`Organization ${userId} not found`);
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

		return this.userRepository.update(userId, {
			firstName: params.firstName,
			lastName: params.lastName,
			birthday: params.birthday,
			gender: params.gender,
			imageUuid: imageUuid || null,
			isPrimary: params.isPrimary,
			status: params.status || "inactive",
		});

	}
}
