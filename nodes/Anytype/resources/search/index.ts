import type { INodeProperties } from 'n8n-workflow';
import { buildResource, searchBody } from '../../shared/buildResource';
import { filtersField, sortFields, textField } from '../../shared/fields';

const searchFields = (show: Record<string, string[]>): INodeProperties[] => [
	textField('query', 'Query', show, { description: 'Text to search within object names and content' }),
	{
		displayName: 'Type Names or IDs',
		name: 'typeKeys',
		type: 'multiOptions',
		default: [],
		displayOptions: { show },
		typeOptions: { loadOptionsMethod: 'getTypeKeys', loadOptionsDependsOn: ['spaceId'] },
		description: 'Limit search to these object types. File-layout types (file, image, video, audio) are excluded unless listed. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	...sortFields(show),
	filtersField(show),
];

const SEARCH_BODY_HINT =
	'SearchRequest JSON, e.g. {"query":"invoice","types":["page"],"sort":{...},"filters":{...}}. Use JSON mode for nested OR filters.';

export const searchDescription: INodeProperties[] = buildResource({
	resource: 'search',
	defaultOperation: 'globalSearch',
	operations: [
		{
			value: 'globalSearch',
			name: 'Search Globally',
			description: 'Search objects across all spaces',
			method: 'POST',
			url: '/search',
			unwrap: 'data',
			paginated: true,
			body: { fields: searchFields, preSend: searchBody },
			bodyDescription: SEARCH_BODY_HINT,
		},
		{
			value: 'spaceSearch',
			name: 'Search in Space',
			description: 'Search objects within a specific space',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/search',
			unwrap: 'data',
			paginated: true,
			body: { fields: searchFields, preSend: searchBody },
			bodyDescription: SEARCH_BODY_HINT,
		},
	],
	idParams: [{ name: 'spaceId', label: 'Space', ops: ['spaceSearch'], loader: 'getSpaces' }],
});
