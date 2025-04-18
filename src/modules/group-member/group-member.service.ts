import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import GroupMember, { GroupMemberUpdateAttributes } from "../../../database/models/group-member";
import { GroupMemberCreateBodyInterface } from "../../interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "../../interfaces/group-member-update-body.interface";
import { GroupMemberRepository } from "./group-member.repository";
import { GroupsRepository } from "../groups/groups.repository";
import { UsersRepository } from "../users/users.repository";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class GroupMemberService {
	private i18n: I18nType;
	constructor(
		@inject("GroupMemberRepository") private groupMemberRepository: GroupMemberRepository,
		@inject("GroupsRepository") private groupRepository: GroupsRepository,
		@inject("UsersRepository") private usersRepository: UsersRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(groupId: number, params: GroupMemberCreateBodyInterface): Promise<GroupMember> {
		const group = await this.groupRepository.read(groupId);
		if (!group) {
			throw new NotFoundError(
				`${this.i18n.__("error.group.name")} ${groupId} ${this.i18n.__("error.common.not_found")}`
			);
		}
		const user = await this.usersRepository.read(params.userId);
		if (!user) {
			throw new NotFoundError(
				`${this.i18n.__("error.user.name")} ${params.userId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const exists = await this.groupMemberRepository.search(
			{
				groupId,
				userId: [params.userId],
			},
			{ onlyTotal: true }
		);
		if (exists.total > 0) {
			throw new ValidationError(
				{},
				`${this.i18n.__("error.user.name")} ${params.userId} ${this.i18n.__("error.group_member.already_group_member")}`
			);
		}

		return this.groupMemberRepository.create({
			orgId: group.orgId,
			region: group.region,
			groupId: groupId,
			accountId: user.accountId,
			userId: params.userId,
			status: params.status || "inactive",
			metadata: params.metadata || {},
		});
	}

	public async update(groupMemberId: number, params: GroupMemberUpdateBodyInterface): Promise<GroupMember> {
		const groupMember = await this.groupMemberRepository.read(groupMemberId);
		if (!groupMember) {
			throw new NotFoundError(
				`${this.i18n.__("error.group_member.name")} ${groupMember} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return this.groupMemberRepository.update(groupMemberId, {
			status: params.status,
			metadata: params.metadata,
		});
	}
}
