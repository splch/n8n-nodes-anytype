import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';
import { textField } from '../../shared/fields';
import { PropertyFormats } from '../../generated/spec';

const ALL_OPS = ['create', 'delete', 'get', 'getAll', 'update'];

const createBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('name', 'Name', show, { required: true }),
		{
			displayName: 'Format',
			name: 'format',
			type: 'options',
			required: true,
			options: [...PropertyFormats],
			default: '',
			displayOptions: { show },
		},
		textField('key', 'Key', show, { description: 'Optional snake_case key (auto-generated when empty)' }),
	],
	preSend: bodyFrom({ name: 'name', format: 'format', key: 'key' }),
};

const updateBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('name', 'Name', show, { required: true }),
		textField('key', 'Key', show),
	],
	preSend: bodyFrom({ name: 'name', key: 'key' }),
};

export const propertiesDescription: INodeProperties[] = buildResource({
	resource: 'property',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'create',
			name: 'Create',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/properties',
			unwrap: 'property',
			body: createBody,
			bodyDescription: 'CreatePropertyRequest JSON. Requires format and name; tags allowed for select/multi_select.',
		},
		{
			value: 'delete',
			name: 'Delete',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
			unwrap: 'property',
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
			unwrap: 'property',
		},
		{
			value: 'getAll',
			name: 'Get Many',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/properties',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'update',
			name: 'Update',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}/properties/{{$parameter.propertyId}}',
			unwrap: 'property',
			body: updateBody,
			bodyDescription: 'UpdatePropertyRequest JSON. Requires name.',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ALL_OPS, loader: 'getSpaces' },
		{ name: 'propertyId', label: 'Property', ops: ['delete', 'get', 'update'], loader: 'getProperties', dependsOn: ['spaceId'] },
	],
});
