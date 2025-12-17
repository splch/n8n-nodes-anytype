import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForObjects = {
	resource: ['object'],
};

const showOnlyForObjectsGetAll = {
	resource: ['object'],
	operation: ['getAll'],
};

const showOnlyForObjectGetUpdateDelete = {
	resource: ['object'],
	operation: ['get', 'update', 'delete'],
};

const showOnlyForObjectCreateOrUpdate = {
	resource: ['object'],
	operation: ['create', 'update'],
};

export const objectsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForObjects },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List objects',
				description: 'List objects in a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/objects',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create an object',
				description: 'Create a new object in a space',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/objects',
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
				action: 'Get an object',
				description: 'Get a single object',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an object',
				description: 'Update an existing object',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
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
				action: 'Delete an object',
				description: 'Delete (archive) an object',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
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
		displayOptions: { show: showOnlyForObjects },
		description: 'Space ID',
	},

	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForObjectGetUpdateDelete },
		description: 'Object ID',
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: { show: showOnlyForObjectCreateOrUpdate },
		description: 'CreateObjectRequest / UpdateObjectRequest JSON',
	},

	...paginationFields(showOnlyForObjectsGetAll),
];
