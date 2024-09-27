export interface AccountCreateBodyInterface {
	orgId: number;
	status?: "active" | "inactive";
	/**
	 * Custom fields with their values.
	 * Custom field must be created before.
	 */
	metadata?: Record<string, string>;
}
