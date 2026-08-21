import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';
import { textField } from '../../shared/fields';

const spaceBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('name', 'Name', show),
		textField('description', 'Description', show),
	],
	preSend: bodyFrom({ name: 'name', description: 'description' }),
};

export const spacesDescription: INodeProperties[] = buildResource({
	resource: 'space',
	defaultOperation: 'getAll',
	operations: [
		{ value: 'getAll', name: 'Get Many', method: 'GET', url: '/spaces', unwrap: 'data', paginated: true },
		{
			value: 'create',
			name: 'Create',
			method: 'POST',
			url: '/spaces',
			unwrap: 'space',
			body: spaceBody,
			bodyDescription: 'CreateSpaceRequest JSON. Requires name.',
		},
		{ value: 'get', name: 'Get', method: 'GET', url: '=/spaces/{{$parameter.spaceId}}', unwrap: 'space' },
		{
			value: 'update',
			name: 'Update',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}',
			unwrap: 'space',
			body: spaceBody,
			bodyDescription: 'UpdateSpaceRequest JSON.',
		},
	],
	idParams: [{ name: 'spaceId', label: 'Space', ops: ['get', 'update'], loader: 'getSpaces' }],
});
