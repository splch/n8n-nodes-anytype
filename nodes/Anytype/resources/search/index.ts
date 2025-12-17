import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForSearch = {
	resource: ['search'],
};

const showOnlyForSpaceSearch = {
	resource: ['search'],
	operation: ['spaceSearch'],
};

const showOnlyForAnySearch = {
	resource: ['search'],
	operation: ['globalSearch', 'spaceSearch'],
};

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSearch,
		},
		options: [
			{
				name: 'Search Globally',
				value: 'globalSearch',
				action: 'Search objects across all spaces',
				description: 'Search objects across all spaces',
				routing: {
					request: {
						method: 'POST',
						url: '/search',
						body: '={{$parameter.body}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Search in Space',
				value: 'spaceSearch',
				action: 'Search objects within a space',
				description: 'Search objects within a specific space',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/search',
						body: '={{$parameter.body}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'globalSearch',
	},

	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSpaceSearch,
		},
		description: 'Space ID (from Spaces → Get Many)',
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {
			query: '',
		},
		displayOptions: {
			show: showOnlyForAnySearch,
		},
		description: 'SearchRequest JSON. Example: {"query":"invoice","types":["page","task"],"sort":[...],"filters":[...]}.',
	},

	...paginationFields(showOnlyForAnySearch),
];
