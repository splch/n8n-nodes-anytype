import type { INodeProperties } from 'n8n-workflow';

type Show = { [key: string]: string[] };

/**
 * Anytype paginated endpoints use query params:
 * - offset
 * - limit
 *
 * And return:
 * { data: [...], pagination: { offset, limit, total, has_more } }
 */
export function paginationFields(
	show: Show,
	options?: {
		defaultLimit?: number;
		maxLimit?: number;
		pageSize?: number;
	},
): INodeProperties[] {
	const defaultLimit = options?.defaultLimit ?? 100;
	const maxLimit = options?.maxLimit ?? 1000;
	const pageSize = options?.pageSize ?? 100;

	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results (uses offset/limit pagination)',
			routing: {
				send: {
					paginate: '={{ $value }}',
				},
				operations: {
					pagination: {
						type: 'offset',
						properties: {
							limitParameter: 'limit',
							offsetParameter: 'offset',
							pageSize,
							type: 'query',
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					...show,
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
				maxValue: maxLimit,
			},
			default: defaultLimit,
			description: 'Max number of results to return',
			routing: {
				send: {
					type: 'query',
					property: 'limit',
				},
				output: {
					maxResults: '={{$value}}',
				},
			},
		},
	];
}
