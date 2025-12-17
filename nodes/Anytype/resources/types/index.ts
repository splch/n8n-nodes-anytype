import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForTypes = {
	resource: ['type'],
};

const showOnlyForTypesGetAll = {
	resource: ['type'],
	operation: ['getAll'],
};

const showOnlyForTypeGetUpdateDelete = {
	resource: ['type'],
	operation: ['get', 'update', 'delete'],
};

const showOnlyForTypeCreateOrUpdate = {
	resource: ['type'],
	operation: ['create', 'update'],
};

export const typesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForTypes },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List types',
				description: 'List types in a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/types',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a type',
				description: 'Create a new type',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/types',
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
				action: 'Get a type',
				description: 'Get a single type',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a type',
				description: 'Update a type',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
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
				action: 'Delete a type',
				description: 'Delete a type',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
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
		displayOptions: { show: showOnlyForTypes },
		description: 'Space ID',
	},

	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForTypeGetUpdateDelete },
		description: 'Type ID',
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: { show: showOnlyForTypeCreateOrUpdate },
		description: 'CreateTypeRequest / UpdateTypeRequest JSON',
	},

	...paginationFields(showOnlyForTypesGetAll),
];
