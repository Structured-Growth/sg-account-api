import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";

export interface PreferencesSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId"> {}
