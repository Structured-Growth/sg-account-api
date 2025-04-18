import * as slug from "slug";
import { v4 } from "uuid";
import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import Group, { GroupUpdateAttributes } from "../../../database/models/group";
import { GroupCreateBodyInterface } from "../../interfaces/group-create-body.interface";
import { GroupUpdateBodyInterface } from "../../interfaces/group-update-body.interface";
import { GroupsRepository } from "./groups.repository";
import { AccountRepository } from "../accounts/accounts.repository";
import { ImageValidator } from "../../validators/image.validator";
import { isUndefined, omitBy, partial } from "lodash";

@autoInjectable()
export class GroupService {
	private i18n: I18nType;
	constructor(
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("GroupsRepository") private groupRepository: GroupsRepository,
		@inject("ImageValidator") private imageValidator: ImageValidator,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: GroupCreateBodyInterface): Promise<Group> {
		const account = await this.accountRepository.read(params.accountId, {
			attributes: ["id", "orgId", "region"],
		});

		if (!account) {
			throw new NotFoundError(
				`${this.i18n.__("error.account.name")} ${params.accountId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		let parentGroup: Group | undefined;

		if (params.parentGroupId) {
			parentGroup = await this.groupRepository.read(params.parentGroupId, {
				attributes: ["id"],
			});
			if (!parentGroup) {
				throw new NotFoundError(
					`${this.i18n.__("error.group.parent_group")} ${params.parentGroupId} ${this.i18n.__(
						"error.common.not_found"
					)}`
				);
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
				title: this.i18n.__("error.group.same_name"),
			});
		}

		let imageUuid = null;

		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: this.i18n.__("error.group.invalid_image_file"),
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
			throw new NotFoundError(`${this.i18n.__("error.group.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
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
					title: this.i18n.__("error.group.same_name"),
				});
			}
		}

		let parentGroup: Group | undefined;
		if (params.parentGroupId) {
			parentGroup = await this.groupRepository.read(params.parentGroupId);
			if (!parentGroup) {
				throw new NotFoundError(
					`${this.i18n.__("error.group.parent_group")} ${params.parentGroupId} ${this.i18n.__(
						"error.common.not_found"
					)}`
				);
			}
		}

		let imageUuid;
		if (params.imageBase64) {
			if (!this.imageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, "base64"))) {
				throw new ValidationError({
					title: this.i18n.__("error.group.invalid_image_file"),
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
