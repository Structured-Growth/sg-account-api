import { autoInjectable, RepositoryInterface, SearchResultInterface } from "@structured-growth/microservice-sdk";
import Organization, { PhoneCreationAttributes } from "../../../database/models/phone";
import { PhoneSearchParamsInterface } from "../../interfaces/phone-search-params.interface";

@autoInjectable()
export class PhonesRepository
	implements RepositoryInterface<Organization, PhoneSearchParamsInterface, PhoneCreationAttributes>
{

}