import * as slug from "slug";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import Group, { GroupUpdateAttributes } from "../../../database/models/group";
import { GroupCreateBodyInterface } from "../../interfaces/group-create-body.interface";
import { GroupUpdateBodyInterface } from "../../interfaces/group-update-body.interface";
import { GroupsRepository } from "./groups.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy, partial } from "lodash";

@autoInjectable()
export class GroupService {
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("GroupsRepository") private groupRepository: GroupsRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator
	) {}

	public async create(params: GroupCreateBodyInterface): Promise<Group> {
		const account = await this.accountRepository.read(params.accountId, {
			attributes: ["id", "orgId", "region"],
		});

		if (!account) {
			throw new NotFoundError(`Account ${params.accountId} not found`);
		}

		let parentGroup: Group | undefined;

		if (params.parentGroupId) {
			parentGroup = await this.groupRepository.read(params.parentGroupId, {
				attributes: ["id"],
			});
			if (!parentGroup) {
				throw new NotFoundError(`Parent group ${params.parentGroupId} not found`);
			}
		}

		const name = slug(params.title);
		const countResult = await Group.count({
			where: { name },
			group: [],
		});
		const count = countResult[0]?.count || 0;

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
			orgId: params.orgId || account.orgId,
			region: account.region,
			accountId: params.accountId,
			parentGroupId: parentGroup?.id,
			title: params.title,
			name,
			status: params.status || "inactive",
			imageUuid: imageUuid || null,
			metadata: params.metadata || {},
		});
	}

	public async update(id, params: GroupUpdateBodyInterface): Promise<Group> {
		const checkGroup = await this.groupRepository.read(id);
		if (!checkGroup) {
			throw new NotFoundError(`Group ${id} not found`);
		}

		let name;
		if (params.title && params.title !== checkGroup.title) {
			name = slug(params.title);
			const countResult = await Group.count({
				where: { name },
				group: [],
			});
			const count = countResult[0]?.count || 0;

			if (count > 0) {
				throw new ValidationError({
					title: "Group with the same name is already exist",
				});
			}
		}

		let parentGroup: Group | undefined;
		if (params.parentGroupId) {
			parentGroup = await this.groupRepository.read(params.parentGroupId);
			if (!parentGroup) {
				throw new NotFoundError(`Parent group ${params.parentGroupId} not found`);
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
					parentGroupId: parentGroup?.id,
					title: params.title,
					name,
					status: params.status,
					imageUuid,
					metadata: params.metadata,
				},
				isUndefined
			) as GroupUpdateAttributes
		);
	}
}
