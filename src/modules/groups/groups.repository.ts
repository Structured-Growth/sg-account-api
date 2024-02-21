import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Group, { GroupCreationAttributes } from "../../../database/models/group";
import { GroupSearchParamsInterface } from "../../interfaces/group-search-params.interface";

@autoInjectable()
export class OrganizationRepository
	implements RepositoryInterface<Group, GroupSearchParamsInterface, GroupCreationAttributes>
{

}