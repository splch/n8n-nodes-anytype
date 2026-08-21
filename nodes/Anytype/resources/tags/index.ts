import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';
import { colorField, textField } from '../../shared/fields';

const ALL_OPS = ['create', 'delete', 'get', 'getAll', 'update'];

const createBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('name', 'Name', show, { required: true }),
		colorField(show, true),
		textField('key', 'Key', show, { description: 'Optional custom key for the tag' }),
	],
	preSend: bodyFrom({ name: 'name', color: 'color', key: 'key' }),
};

const updateBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('name', 'Name', show),
		colorField(show),
		textField('key', 'Key', show),
	],
	preSend: bodyFrom({ name: 'name', color: 'color', key: 'key' }),
};

export const tagsDescription: INodeProperties[] = buildResource({
	resource: 'tag',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'create',
			name: 'Create',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}/tags',
			unwrap: 'tag',
			body: createBody,
			bodyDescription: 'CreateTagRequest JSON. Requires color and name.',
		},
		{
			value: 'delete',
			name: 'Delete',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}/tags/{{$parameter.tagId}}',
			unwrap: 'tag',
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}/tags/{{$parameter.tagId}}',
			unwrap: 'tag',
		},
		{
			value: 'getAll',
			name: 'Get Many',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}/tags',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'update',
			name: 'Update',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}/tags/{{$parameter.tagId}}',
			unwrap: 'tag',
			body: updateBody,
			bodyDescription: 'UpdateTagRequest JSON.',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ALL_OPS, loader: 'getSpaces' },
		{ name: 'propertyId', label: 'Property', ops: ALL_OPS, loader: 'getProperties', dependsOn: ['spaceId'] },
		{ name: 'tagId', label: 'Tag', ops: ['delete', 'get', 'update'], loader: 'getTags', dependsOn: ['spaceId', 'propertyId'] },
	],
});
