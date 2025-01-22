export interface GroupCreateBodyInterface {
	orgId?: number;
	accountId: number;
	parentGroupId?: number;
	title: string;
	status: "active" | "inactive";
	imageBase64?: string;
	/**
	 * Custom fields with their values.
	 * Custom field must be created before.
	 */
	metadata?: Record<string, string>;
}
