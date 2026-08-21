import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';
import { textField } from '../../shared/fields';
import { TypeLayouts } from '../../generated/spec';

const ALL_OPS = ['create', 'delete', 'get', 'getAll', 'update'];

function typeFields(show: Record<string, string[]>, creating: boolean): INodeProperties[] {
	return [
		textField('name', 'Name', show, { required: creating }),
		textField('pluralName', 'Plural Name', show, { required: creating }),
		{
			displayName: 'Layout',
			name: 'layout',
			type: 'options',
			required: creating,
			options: [...TypeLayouts],
			default: '',
			displayOptions: { show },
		},
		textField('key', 'Key', show, { description: 'Optional snake_case key (auto-generated when empty)' }),
	];
}

const map = { name: 'name', pluralName: 'plural_name', layout: 'layout', key: 'key' };

export const typesDescription: INodeProperties[] = buildResource({
	resource: 'type',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'create',
			name: 'Create',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/types',
			unwrap: 'type',
			body: { fields: (show) => typeFields(show, true), preSend: bodyFrom(map) },
			bodyDescription:
				'CreateTypeRequest JSON. Requires layout, name, plural_name; use JSON mode to link properties or set an icon.',
		},
		{
			value: 'delete',
			name: 'Delete',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
			unwrap: 'type',
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
			unwrap: 'type',
		},
		{
			value: 'getAll',
			name: 'Get Many',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/types',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'update',
			name: 'Update',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}',
			unwrap: 'type',
			body: { fields: (show) => typeFields(show, false), preSend: bodyFrom(map) },
			bodyDescription: 'UpdateTypeRequest JSON; use JSON mode to link properties or set an icon.',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ALL_OPS, loader: 'getSpaces' },
		{ name: 'typeId', label: 'Type', ops: ['delete', 'get', 'update'], loader: 'getTypes', dependsOn: ['spaceId'] },
	],
});
