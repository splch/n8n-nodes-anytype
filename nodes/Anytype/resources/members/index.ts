import type { INodeProperties } from 'n8n-workflow';
import { buildResource } from '../../shared/buildResource';

export const membersDescription: INodeProperties[] = buildResource({
	resource: 'member',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'getAll',
			name: 'Get Many',
			description: 'List members of a space',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/members',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/members/{{$parameter.memberId}}',
			unwrap: 'member',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ['getAll', 'get'], loader: 'getSpaces' },
		{ name: 'memberId', label: 'Member', ops: ['get'], loader: 'getMembers', dependsOn: ['spaceId'] },
	],
});
