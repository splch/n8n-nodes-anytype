import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequest = {
	resource: ['request'],
};

const showOnlyForWriteMethods = {
	resource: ['request'],
	operation: ['post', 'patch', 'put', 'delete'],
};

export const requestDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForRequest },
		options: [
			{
				name: 'GET',
				value: 'get',
				action: 'Make a GET request',
				routing: {
					request: {
						method: 'GET',
						url: '={{$parameter.endpoint}}',
						qs: '={{$parameter.queryParameters}}',
					},
				},
			},
			{
				name: 'POST',
				value: 'post',
				action: 'Make a POST request',
				routing: {
					request: {
						method: 'POST',
						url: '={{$parameter.endpoint}}',
						qs: '={{$parameter.queryParameters}}',
						body: '={{$parameter.body}}',
					},
				},
			},
			{
				name: 'PATCH',
				value: 'patch',
				action: 'Make a PATCH request',
				routing: {
					request: {
						method: 'PATCH',
						url: '={{$parameter.endpoint}}',
						qs: '={{$parameter.queryParameters}}',
						body: '={{$parameter.body}}',
					},
				},
			},
			{
				name: 'PUT',
				value: 'put',
				action: 'Make a PUT request',
				routing: {
					request: {
						method: 'PUT',
						url: '={{$parameter.endpoint}}',
						qs: '={{$parameter.queryParameters}}',
						body: '={{$parameter.body}}',
					},
				},
			},
			{
				name: 'DELETE',
				value: 'delete',
				action: 'Make a DELETE request',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{$parameter.endpoint}}',
						qs: '={{$parameter.queryParameters}}',
						body: '={{$parameter.body}}',
					},
				},
			},
		],
		default: 'get',
	},

	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		required: true,
		default: '/spaces',
		displayOptions: { show: showOnlyForRequest },
		description:
			'API path (e.g. /spaces) or full URL. If you pass a full URL, it should work as an absolute request.',
	},

	{
		displayName: 'Query Parameters',
		name: 'queryParameters',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForRequest },
		description: 'Query string parameters as JSON object (e.g. {"limit": 10, "offset": 0})',
	},

	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		default: {},
		displayOptions: { show: showOnlyForWriteMethods },
		description: 'Request body as JSON (for POST/PATCH/PUT/DELETE)',
	},
];
