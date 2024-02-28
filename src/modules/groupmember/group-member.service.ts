import { autoInjectable, inject, NotFoundError } from "@structured-growth/microservice-sdk";
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
		@inject("UsersRepository") private usersRepository: UsersRepository,
	) {}

	public async create(params: GroupMemberCreateBodyInterface): Promise<GroupMember> {
		const group = await this.groupRepository.read(params.groupId);
		if (!group) {
			throw new NotFoundError(`Group ${params.groupId} not found`);
		}
		const user = await this.usersRepository.read(params.userId);
		if (!user) {
			throw new NotFoundError(`User ${params.userId} not found`);
		}

		return this.groupMemberRepository.create({
			orgId: group.orgId,
			region: group.region,
			accountId: group.accountId,
			groupId: params.groupId,
			userId: params.userId,
			status: params.status || "inactive",
		});
	}

	public async update(groupId, params: GroupMemberUpdateBodyInterface): Promise<GroupMember> {
		const group = await this.groupRepository.read(groupId);
		if (!group) {
			throw new NotFoundError(`Group ${groupId} not found`);
		}

		const user = await this.usersRepository.read(params.groupMemberId);
		if (!user) {
			throw new NotFoundError(`User ${params.groupMemberId} not found`);
		}

		return this.groupMemberRepository.update(
			params.groupMemberId,
			omitBy(
				{
					status: params.status,
				},
				isUndefined
			) as GroupMemberUpdateAttributes
		);
	}
}
