import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForTags = {
	resource: ['tag'],
};

const showOnlyForTagsGetAll = {
	resource: ['tag'],
	operation: ['getAll'],
};

const showOnlyForTagGetUpdateDelete = {
	resource: ['tag'],
	operation: ['get', 'update', 'delete'],
};

const showOnlyForTagCreateOrUpdate = {
	resource: ['tag'],
	operation: ['create', 'update'],
};

export const tagsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForTags },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a tag',
				description: 'Create a new tag',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/tags',
						body: '={{$parameter.body}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a tag',
				description: 'Delete a tag',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/spaces/{{$parameter.spaceId}}/tags/{{$parameter.tagId}}',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a tag',
				description: 'Get a single tag',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/tags/{{$parameter.tagId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List tags',
				description: 'List tags in a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/tags',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a tag',
				description: 'Update a tag',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/spaces/{{$parameter.spaceId}}/tags/{{$parameter.tagId}}',
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
		displayOptions: { show: showOnlyForTags },
	},

	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForTagGetUpdateDelete },
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: { show: showOnlyForTagCreateOrUpdate },
		description: 'CreateTagRequest / UpdateTagRequest JSON',
	},

	...paginationFields(showOnlyForTagsGetAll),
];
