import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { searchDescription } from './resources/search';
import { spacesDescription } from './resources/spaces';
import { listsDescription } from './resources/lists';
import { membersDescription } from './resources/members';
import { objectsDescription } from './resources/objects';
import { propertiesDescription } from './resources/properties';
import { tagsDescription } from './resources/tags';
import { typesDescription } from './resources/types';
import { templatesDescription } from './resources/templates';

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

		credentials: [{ name: 'anytypeApi', required: true }],

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
					{ name: 'List', value: 'list' },
					{ name: 'Member', value: 'member' },
					{ name: 'Object', value: 'object' },
					{ name: 'Property', value: 'property' },
					{ name: 'Search', value: 'search' },
					{ name: 'Space', value: 'space' },
					{ name: 'Tag', value: 'tag' },
					{ name: 'Template', value: 'template' },
					{ name: 'Type', value: 'type' },
				],
				default: 'object',
			},

			...searchDescription,
			...spacesDescription,
			...listsDescription,
			...membersDescription,
			...objectsDescription,
			...propertiesDescription,
			...tagsDescription,
			...typesDescription,
			...templatesDescription,
		],
	};
}
