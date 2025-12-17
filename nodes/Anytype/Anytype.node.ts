import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { authDescription } from './resources/auth';
import { searchDescription } from './resources/search';
import { spacesDescription } from './resources/spaces';
import { listsDescription } from './resources/lists';
import { membersDescription } from './resources/members';
import { objectsDescription } from './resources/objects';
import { propertiesDescription } from './resources/properties';
import { tagsDescription } from './resources/tags';
import { typesDescription } from './resources/types';
import { templatesDescription } from './resources/templates';
import { requestDescription } from './resources/request';

export class Anytype implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Anytype',
		name: 'anytype',
		icon: { light: 'file:anytype.svg', dark: 'file:anytype.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Anytype API',
		defaults: {
			name: 'Anytype',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],

		// Optional so Auth endpoints can be used without a token if needed.
		// For everything else, set credentials to avoid 401 errors.
		credentials: [{ name: 'anytypeApi', required: false }],

		requestDefaults: {
			baseURL:
				'={{ ($credentials && $credentials.baseUrl) ? $credentials.baseUrl : "http://127.0.0.1:31009/v1" }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Anytype-Version':
					'={{ ($credentials && $credentials.apiVersion) ? $credentials.apiVersion : "2025-11-08" }}',
			},
		},

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Objects', value: 'object' },
					{ name: 'Search', value: 'search' },
					{ name: 'Spaces', value: 'space' },
					{ name: 'Lists', value: 'list' },
					{ name: 'Members', value: 'member' },
					{ name: 'Properties', value: 'property' },
					{ name: 'Tags', value: 'tag' },
					{ name: 'Types', value: 'type' },
					{ name: 'Templates', value: 'template' },
					{ name: 'Auth', value: 'auth' },
					{ name: 'API Request', value: 'request' },
				],
				default: 'object',
			},

			...authDescription,
			...searchDescription,
			...spacesDescription,
			...listsDescription,
			...membersDescription,
			...objectsDescription,
			...propertiesDescription,
			...tagsDescription,
			...typesDescription,
			...templatesDescription,
			...requestDescription,
		],
	};
}
