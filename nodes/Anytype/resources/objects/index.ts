import type { INodeProperties } from 'n8n-workflow';
import { buildResource, createObjectBody, updateObjectBody } from '../../shared/buildResource';
import { propertyValuesField, textField } from '../../shared/fields';

const createFields = (show: Record<string, string[]>): INodeProperties[] => [
	{
		displayName: 'Type Name or ID',
		name: 'typeKey',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show },
		typeOptions: { loadOptionsMethod: 'getTypeKeys', loadOptionsDependsOn: ['spaceId'] },
		description: 'Type of object to create (e.g. page, task). Choose from the list or use an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	textField('name', 'Name', show),
	textField('markdown', 'Body', show, {
		typeOptions: { rows: 8 },
		description: 'Object body; Markdown is supported',
	}),
	textField('templateId', 'Template', show, {
		typeOptions: { loadOptionsMethod: 'getTemplates', loadOptionsDependsOn: ['spaceId'] },
		description: 'Template to create the object from',
	}),
	propertyValuesField(show),
];

const updateFields = (show: Record<string, string[]>): INodeProperties[] => [
	textField('name', 'Name', show),
	textField('markdown', 'Body', show, {
		typeOptions: { rows: 8 },
		description: 'Replaces the object body; Markdown is supported',
	}),
	textField('typeKey', 'Type', show, {
		typeOptions: { loadOptionsMethod: 'getTypeKeys', loadOptionsDependsOn: ['spaceId'] },
		description: 'Change the object type (optional)',
	}),
	propertyValuesField(show),
];

export const objectsDescription: INodeProperties[] = buildResource({
	resource: 'object',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'create',
			name: 'Create',
			description: 'Create a new object in a space',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/objects',
			unwrap: 'object',
			simplify: true,
			body: { fields: createFields, preSend: createObjectBody },
			bodyDescription: 'CreateObjectRequest JSON. Requires type_key.',
		},
		{
			value: 'delete',
			name: 'Delete',
			description: 'Delete (archive) an object',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
			unwrap: 'object',
			simplify: true,
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
			unwrap: 'object',
			simplify: true,
		},
		{
			value: 'getAll',
			name: 'Get Many',
			description: 'List objects in a space',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/objects',
			unwrap: 'data',
			simplify: true,
			paginated: true,
		},
		{
			value: 'update',
			name: 'Update',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}/objects/{{$parameter.objectId}}',
			unwrap: 'object',
			simplify: true,
			body: { fields: updateFields, preSend: updateObjectBody },
			bodyDescription: 'UpdateObjectRequest JSON.',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ['create', 'delete', 'get', 'getAll', 'update'], loader: 'getSpaces' },
		{ name: 'objectId', label: 'Object', ops: ['delete', 'get', 'update'], loader: 'getObjects', dependsOn: ['spaceId'] },
	],
});
