import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAuth = {
	resource: ['auth'],
};

const showOnlyForCreateChallenge = {
	resource: ['auth'],
	operation: ['createChallenge'],
};

const showOnlyForCreateApiKey = {
	resource: ['auth'],
	operation: ['createApiKey'],
};

export const authDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAuth,
		},
		options: [
			{
				name: 'Create Challenge',
				value: 'createChallenge',
				action: 'Create an auth challenge',
				description: 'Start the authorization flow (shows a 4-digit code in Anytype Desktop)',
				routing: {
					request: {
						method: 'POST',
						url: '/auth/challenges',
					},
				},
			},
			{
				name: 'Create API Key',
				value: 'createApiKey',
				action: 'Create an API key',
				description: 'Solve the challenge to get an API key (Bearer token)',
				routing: {
					request: {
						method: 'POST',
						url: '/auth/api_keys',
					},
				},
			},
		],
		default: 'createChallenge',
	},
	{
		displayName: 'App Name',
		name: 'appName',
		type: 'string',
		required: true,
		default: 'n8n',
		displayOptions: {
			show: showOnlyForCreateChallenge,
		},
		description: 'Name shown in Anytype Desktop when authorizing access',
		routing: {
			send: {
				type: 'body',
				property: 'app_name',
			},
		},
	},
	{
		displayName: 'Challenge ID',
		name: 'challengeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCreateApiKey,
		},
		description: 'Challenge ID returned from Create Challenge',
		routing: {
			send: {
				type: 'body',
				property: 'challenge_id',
			},
		},
	},
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCreateApiKey,
		},
		description: '4-digit code shown in Anytype Desktop',
		routing: {
			send: {
				type: 'body',
				property: 'code',
			},
		},
	},
];
