import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';

const ALL_OPS = ['addObjects', 'removeObject', 'getViews', 'getObjects'];

export const listsDescription: INodeProperties[] = buildResource({
	resource: 'list',
	defaultOperation: 'getViews',
	operations: [
		{
			value: 'addObjects',
			name: 'Add Objects',
			description: 'Add objects to a list (collection)',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/objects',
			body: {
				fields: (show) => [
					{
						displayName: 'Object Names or IDs',
						name: 'objectIds',
						type: 'multiOptions',
						required: true,
						default: [],
						displayOptions: { show },
						typeOptions: { loadOptionsMethod: 'getObjects', loadOptionsDependsOn: ['spaceId'] },
						description: 'Objects to add to the list. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
				],
				preSend: bodyFrom({ objectIds: 'objects' }),
			},
			bodyDescription: 'AddObjectsToListRequest JSON, e.g. {"objects":["<id>",...]}.',
		},
		{
			value: 'removeObject',
			name: 'Remove Object',
			description: 'Remove an object from a list (collection)',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/objects/{{$parameter.objectId}}',
		},
		{
			value: 'getViews',
			name: 'Get Views',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/views',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'getObjects',
			name: 'Get Objects',
			description: 'Get objects in a list view',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/lists/{{$parameter.listId}}/views/{{$parameter.viewId}}/objects',
			unwrap: 'data',
			paginated: true,
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ALL_OPS, loader: 'getSpaces' },
		{ name: 'listId', label: 'List', ops: ALL_OPS, loader: 'getLists', dependsOn: ['spaceId'] },
		{ name: 'objectId', label: 'Object', ops: ['removeObject'], loader: 'getObjects', dependsOn: ['spaceId'] },
		{ name: 'viewId', label: 'View', ops: ['getObjects'], loader: 'getViews', dependsOn: ['spaceId', 'listId'] },
	],
});
