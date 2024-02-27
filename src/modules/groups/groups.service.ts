import slug from "slug";
import { Buffer } from "buffer";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Group, { GroupUpdateAttributes } from "../../../database/models/group";
import { GroupCreateBodyInterface } from "../../interfaces/group-create-body.interface";
import { GroupUpdateBodyInterface } from "../../interfaces/group-update-body.interface";
import { GroupsRepository } from "./groups.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class GroupService {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("GroupsRepository") private groupRepository: GroupsRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator
	) {}

	public async create (params: GroupCreateBodyInterface): Promise<Group> {
		const Account = await this.accountRepository.read(params.accountId);
		if (!Account) {
			throw new NotFoundError(`Account ${params.accountId} not found`);
		}
		const ParentGroup = await this.groupRepository.read(params.parentGroupId);
		if (!ParentGroup) {
			throw new NotFoundError(`Parent group ${params.parentGroupId} not found`);
		}
		const name = slug(params.title);
		const count = await Group.count({
			where: { name },
		});

		if (count > 0) {
			throw new ValidationError({
				title: "Group with the same name is already exist",
			});
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

		return this.groupRepository.create({
			accountId: params.accountId,
			parentGroupId: params.parentGroupId,
			title: params.title,
			status: params.status || "inactive",
			imageUuid: imageUuid || null,
		});
	}
	public async update(id, params: GroupUpdateBodyInterface): Promise<Group> {
			const checkGroup = await this.groupRepository.read(id);
			if (!checkGroup) {
			throw new NotFoundError(`Group ${id} not found`);
		}

		let name;
		if (params.title) {
			name = slug(params.title);
			const count = await Group.count({
				where: { name },
			});

			if (count > 0) {
				throw new ValidationError({
					title: "Group with the same name is already exist",
				});
			}
		}

		let imageUuid;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: "Invalid image file",
				});
			}
			// imageUuid = v4();
			// todo remove old image from S3 bucket
			// todo store image to S3 bucket
		}

		return this.groupRepository.update(
			id,
			omitBy(
				{
					parentGroupId: params.parentGroupId,
					title: params.title,
					name,
					status: params.status,
					imageUuid,
				},
				isUndefined
			) as GroupUpdateAttributes
		);
	}
}
