import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForLists = {
	resource: ['list'],
};

const showOnlyForAnyListOperation = {
	resource: ['list'],
	operation: ['addObjects', 'removeObject', 'getViews', 'getObjects'],
};

const showOnlyForAddObjects = {
	resource: ['list'],
	operation: ['addObjects'],
};

const showOnlyForRemoveObject = {
	resource: ['list'],
	operation: ['removeObject'],
};

const showOnlyForGetObjects = {
	resource: ['list'],
	operation: ['getObjects'],
};

const showOnlyForPaginatedListReads = {
	resource: ['list'],
	operation: ['getViews', 'getObjects'],
};

export const listsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForLists },
		options: [
			{
				name: 'Add Objects',
				value: 'addObjects',
				action: 'Add objects to a list',
				description: 'Add objects to a list (collection)',
				routing: {
					request: {
						method: 'POST',
						url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/objects',
						body: '={{$parameter.body}}',
					},
				},
			},
			{
				name: 'Remove Object',
				value: 'removeObject',
				action: 'Remove an object from a list',
				description: 'Remove an object from a list (collection)',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/objects/{{$parameter.objectId}}',
					},
				},
			},
			{
				name: 'Get Views',
				value: 'getViews',
				action: 'Get list views',
				description: 'Get views for a list',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/views',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get Objects',
				value: 'getObjects',
				action: 'Get objects in a list view',
				description: 'Get objects in a list view',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/views/{{$parameter.viewId}}/objects',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
		],
		default: 'getViews',
	},

	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAnyListOperation },
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAnyListOperation },
		description: 'List (collection) object ID',
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: {},
		displayOptions: { show: showOnlyForAddObjects },
		description:
			'AddObjectsToListRequest JSON. See Anytype API docs for the exact request shape for your API version.',
	},
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForRemoveObject },
		description: 'Object ID to remove from the list',
	},
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForGetObjects },
		description: 'View ID (from Get Views)',
	},

	...paginationFields(showOnlyForPaginatedListReads),
];
