import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForMembers = {
	resource: ['member'],
};

const showOnlyForMembersGetAll = {
	resource: ['member'],
	operation: ['getAll'],
};

const showOnlyForMemberGet = {
	resource: ['member'],
	operation: ['get'],
};

export const membersDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForMembers },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List members',
				description: 'List members in a space',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/members',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a member',
				description: 'Get a single member',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/members/{{$parameter.memberId}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
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
		displayOptions: { show: showOnlyForMembers },
		description: 'Space ID',
	},

	{
		displayName: 'Member ID',
		name: 'memberId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForMemberGet },
		description: 'Member ID (or identity) from Get Many',
	},

	...paginationFields(showOnlyForMembersGetAll),
];
