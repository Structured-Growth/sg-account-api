export interface AccountCreateBodyInterface {
	orgId: number;
	status?: "active" | "inactive";
	/**
	 * Custom fields with their values.
	 * Field should be created before.
	 */
	metadata?: Record<string, string>;
}
