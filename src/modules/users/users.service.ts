import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import User, { UserUpdateAttributes } from "../../../database/models/user";
import { UserCreateBodyInterface } from "../../interfaces/user-create-body.interface";
import { UserUpdateBodyInterface } from "../../interfaces/user-update-body.interface";
import { UsersRepository } from "./users.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy } from "lodash";
import { UserMultiSearchParamsInterface } from "../../interfaces/user-multi-search-params.interface";
import { PhonesRepository } from "../phones/phones.repository";
import { EmailsRepository } from "../emails/emails.repository";

@autoInjectable()
export class UsersService {
	constructor(
		@inject("UsersRepository") private userRepository: UsersRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator,
		@inject("EmailsRepository") private emailsRepository: EmailsRepository,
		@inject("PhonesRepository") private phonesRepository: PhonesRepository
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
					metadata: params.metadata,
				},
				isUndefined
			) as UserUpdateAttributes
		);
	}

	public async multiSearch(params: UserMultiSearchParamsInterface): Promise<Record<number, { [key: string]: any }>> {
		const searchResults = {};

		const [
			firstNameSearchResults,
			lastNameSearchResults,
			emailSearchResults,
			phoneSearchResults,
			accountSearchResults,
		] = await Promise.all([
			this.userRepository.search({
				orgId: params.orgId,
				firstName: [`*${params.search}*`],
			}),
			this.userRepository.search({
				orgId: params.orgId,
				lastName: [`*${params.search}*`],
			}),
			this.emailsRepository.search({
				orgId: params.orgId,
				email: [`*${params.search}*`],
			}),
			this.phonesRepository.search({
				orgId: params.orgId,
				phoneNumber: [`*${params.search}*`],
			}),
			this.accountRepository.search({
				orgId: params.orgId,
				id: [isNaN(parseInt(params.search)) ? 0 : parseInt(params.search)],
				metadata: { accountType: "patient" },
			}),
		]);

		const firstNamesData = firstNameSearchResults.data.map((user) => user.dataValues);
		firstNamesData.forEach((user) => {
			if (!searchResults[user.accountId]) {
				searchResults[user.accountId] = {
					accountId: user.accountId,
					userId: user.id,
					coincidence: { "first name": user.firstName },
				};
			} else {
				if (!searchResults[user.accountId].coincidence["first name"]) {
					searchResults[user.accountId].coincidence["first name"] = user.firstName;
				}
			}
		});

		const lastNamesData = lastNameSearchResults.data.map((user) => user.dataValues);
		lastNamesData.forEach((user) => {
			if (!searchResults[user.accountId]) {
				searchResults[user.accountId] = {
					accountId: user.accountId,
					userId: user.id,
					coincidence: { "last name": user.lastName },
				};
			} else {
				if (!searchResults[user.accountId].coincidence["last name"]) {
					searchResults[user.accountId].coincidence["last name"] = user.lastName;
				}
			}
		});

		const emailsData = emailSearchResults.data.map((email) => email.dataValues);
		emailsData.forEach((email) => {
			if (!searchResults[email.accountId]) {
				searchResults[email.accountId] = {
					accountId: email.accountId,
					userId: email.userId,
					coincidence: { email: email.email },
				};
			} else {
				if (!searchResults[email.accountId].coincidence["email"]) {
					searchResults[email.accountId].coincidence["email"] = email.email;
				}
			}
		});

		const phonesData = phoneSearchResults.data.map((phone) => phone.dataValues);
		phonesData.forEach((phone) => {
			if (!searchResults[phone.accountId]) {
				searchResults[phone.accountId] = {
					accountId: phone.accountId,
					userId: phone.userId,
					coincidence: { phone: phone.phoneNumber },
				};
			} else {
				if (!searchResults[phone.accountId].coincidence["phone"]) {
					searchResults[phone.accountId].coincidence["phone"] = phone.phoneNumber;
				}
			}
		});

		const accountsData = accountSearchResults.data.map((account) => account.dataValues);
		accountsData.forEach((account) => {
			if (!searchResults[account.id]) {
				searchResults[account.id] = {
					accountId: account.id,
					coincidence: { id: account.id },
				};
			} else {
				if (!searchResults[account.id].coincidence["id"]) {
					searchResults[account.id].coincidence["id"] = account.id;
				}
			}
		});

		const filteredResults = {};

		const accountIds = Object.keys(searchResults).map((id) => parseInt(id));

		const filterSearchResults = await this.accountRepository.search({
			orgId: params.orgId,
			id: accountIds,
			metadata: { accountType: "patient" },
		});

		const filterData = filterSearchResults.data.map((account) => account.dataValues);

		const patientAccountIds = filterData.map((account) => account.id);

		patientAccountIds.forEach((accountId) => {
			if (searchResults[accountId]) {
				filteredResults[accountId] = searchResults[accountId];
			}
		});

		return filteredResults;
	}
}
