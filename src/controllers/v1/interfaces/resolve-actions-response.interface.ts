export interface ResolveActionsResponseInterface {
	data: {
		action: string;
		resources: {
			resource: string;
			arnPattern: string;
		}[];
	}[];
}
