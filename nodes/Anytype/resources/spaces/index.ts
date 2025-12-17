import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForSpaces = {
	resource: ['space'],
};

const showOnlyForSpacesGetAll = {
	resource: ['space'],
	operation: ['getAll'],
};

const showOnlyForSpaceGetOrUpdate = {
	resource: ['space'],
	operation: ['get', 'update'],
};

const showOnlyForSpaceCreateOrUpdate = {
	resource: ['space'],
	operation: ['create', 'update'],
};

export const spacesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForSpaces,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many spaces',
				description: 'Get many spaces',
				routing: {
					request: {
						method: 'GET',
						url: '/spaces',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a space',
				description: 'Create a space',
				routing: {
					request: {
						method: 'POST',
						url: '/spaces',
						body: '={{$parameter.body}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a space',
				description: 'Get a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a space',
				description: 'Update a space',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/spaces/{{$parameter.spaceId}}',
						body: '={{$parameter.body}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
		],
		default: 'getAll',
	},

	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForSpaceGetOrUpdate,
		},
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForSpaceCreateOrUpdate,
		},
		description: 'CreateSpaceRequest / UpdateSpaceRequest JSON',
	},

	...paginationFields(showOnlyForSpacesGetAll),
];
