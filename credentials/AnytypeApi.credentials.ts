import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class AnytypeApi implements ICredentialType {
	name = 'anytypeApi';

	displayName = 'Anytype API';

	icon: Icon = 'file:anytype.svg';

	documentationUrl = 'https://github.com/splch/n8n-nodes-anytype#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: 'http://127.0.0.1:31009/v1',
			description: 'Anytype API base URL (usually Anytype Desktop local API)',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			required: true,
			default: '2025-11-08',
			description: 'Value for the Anytype-Version header',
		},
		{
			displayName: 'API Key',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'API key used as a Bearer token (Authorization header)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/spaces',
			method: 'GET',
			headers: {
				'Anytype-Version': '={{$credentials.apiVersion}}',
				Accept: 'application/json',
			},
		},
	};
}
