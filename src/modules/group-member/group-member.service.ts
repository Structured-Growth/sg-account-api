import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import GroupMember, { GroupMemberUpdateAttributes } from "../../../database/models/group-member";
import { GroupMemberCreateBodyInterface } from "../../interfaces/group-member-create-body.interface";
import { GroupMemberUpdateBodyInterface } from "../../interfaces/group-member-update-body.interface";
import { GroupMemberRepository } from "./group-member.repository";
import { GroupsRepository } from "../groups/groups.repository";
import { UsersRepository } from "../users/users.repository";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class GroupMemberService {
	constructor(
		@inject("GroupMemberRepository") private groupMemberRepository: GroupMemberRepository,
		@inject("GroupsRepository") private groupRepository: GroupsRepository,
		@inject("UsersRepository") private usersRepository: UsersRepository
	) {}

	public async create(groupId: number, params: GroupMemberCreateBodyInterface): Promise<GroupMember> {
		const group = await this.groupRepository.read(groupId);
		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}
		const user = await this.usersRepository.read(params.userId);
		if (!user) {
			throw new NotFoundError(`User ${params.userId} not found`);
		}

		const exists = await this.groupMemberRepository.search(
			{
				groupId,
				userId: [params.userId],
			},
			{ onlyTotal: true }
		);
		if (exists.total > 0) {
			throw new ValidationError({}, `User ${params.userId} is already group member`);
		}

		return this.groupMemberRepository.create({
			orgId: group.orgId,
			region: group.region,
			groupId: groupId,
			accountId: group.accountId,
			userId: params.userId,
			status: params.status || "inactive",
		});
	}

	public async update(groupMemberId: number, params: GroupMemberUpdateBodyInterface): Promise<GroupMember> {
		const groupMember = await this.groupMemberRepository.read(groupMemberId);
		if (!groupMember) {
			throw new NotFoundError(`Group member ${groupMember} not found`);
		}

		return this.groupMemberRepository.update(groupMemberId, {
			status: params.status,
		});
	}
}
