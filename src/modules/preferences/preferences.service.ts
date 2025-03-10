import { autoInjectable, inject } from "@structured-growth/microservice-sdk";
import { AccountRepository } from "../accounts/accounts.repository";
import { PreferencesRepository } from "./preferences.repository";
import { Preferences, PreferencesAttributes } from "../../../database/models/preferences";
import { NotFoundError } from "@structured-growth/microservice-sdk";

@autoInjectable()
export class PreferencesService {
	constructor(
		@inject("PreferencesRepository") private preferencesRepository: PreferencesRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository
	) {}

	private defaultPreferences: PreferencesAttributes["preferences"] = {
		units: "metric",
		language: "en",
		locale: "US",
		timezone: "CST",
	};

	/**
	 * Return account preferences. Create if not exists.
	 */
	public async read(accountId: number): Promise<Preferences> {
		const account = await this.accountRepository.read(accountId);
		if (!account) {
			throw new NotFoundError(`Account ${accountId} not found`);
		}
		const exists = await this.preferencesRepository.search({
			accountId,
		});
		const preferences = exists.data[0];

		if (preferences) {
			return preferences;
		} else {
			return this.preferencesRepository.create({
				orgId: account.orgId,
				accountId: account.id,
				region: account.region,
				preferences: this.defaultPreferences,
			});
		}
	}

	/**
	 * Update account preferences. Create if not exists.
	 */
	public async update(accountId: number, params: Partial<PreferencesAttributes>): Promise<Preferences> {
		const preferences = await this.read(accountId);

		if (params.preferences) {
			preferences.set("preferences", { ...preferences.preferences, ...params.preferences });
		}
		if (params.metadata) {
			preferences.set("metadata", { ...preferences.metadata, ...params.metadata });
		}

		return preferences.save();
	}
}
