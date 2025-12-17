import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForProperties = {
	resource: ['property'],
};

const showOnlyForPropertiesGetAll = {
	resource: ['property'],
	operation: ['getAll'],
};

const showOnlyForPropertyGetUpdateDelete = {
	resource: ['property'],
	operation: ['get', 'update', 'delete'],
};

const showOnlyForPropertyCreateOrUpdate = {
	resource: ['property'],
	operation: ['create', 'update'],
};

export const propertiesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForProperties },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List properties',
				description: 'List properties in a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/properties',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a property',
				description: 'Create a new property',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/properties',
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
				action: 'Get a property',
				description: 'Get a single property',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a property',
				description: 'Update an existing property',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
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
				action: 'Delete a property',
				description: 'Delete a property',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
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
		displayOptions: { show: showOnlyForProperties },
		description: 'Space ID',
	},

	{
		displayName: 'Property ID',
		name: 'propertyId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForPropertyGetUpdateDelete },
		description: 'Property ID',
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: { show: showOnlyForPropertyCreateOrUpdate },
		description: 'CreatePropertyRequest / UpdatePropertyRequest JSON',
	},

	...paginationFields(showOnlyForPropertiesGetAll),
];
