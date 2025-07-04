import { autoInjectable, inject, I18nType } from "@structured-growth/microservice-sdk";
import { AccountRepository } from "../accounts/accounts.repository";
import { PreferencesRepository } from "./preferences.repository";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import { Preferences, PreferencesAttributes } from "../../../database/models/preferences";
import { NotFoundError } from "@structured-growth/microservice-sdk";

@autoInjectable()
export class PreferencesService {
	private i18n: I18nType;
	constructor(
		@inject("PreferencesRepository") private preferencesRepository: PreferencesRepository,
		@inject("AccountRepository") private accountRepository: AccountRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

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
			throw new NotFoundError(
				`${this.i18n.__("error.account.name")} ${accountId} ${this.i18n.__("error.common.not_found")}`
			);
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
			await this.customFieldService.validate("Preferences", params.metadata, preferences.orgId);
			preferences.set("metadata", { ...preferences.metadata, ...params.metadata });
		}

		return preferences.save();
	}
}
