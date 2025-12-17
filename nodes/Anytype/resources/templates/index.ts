import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from '../shared/pagination';

const showOnlyForTemplates = {
	resource: ['template'],
};

const showOnlyForTemplatesGetAll = {
	resource: ['template'],
	operation: ['getAll'],
};

const showOnlyForTemplateGet = {
	resource: ['template'],
	operation: ['get'],
};

const showOnlyForAnyTemplateOperation = {
	resource: ['template'],
	operation: ['getAll', 'get'],
};

export const templatesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForTemplates },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'List templates',
				description: 'List templates for a type',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}/templates',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a template',
				description: 'Get a single template',
				routing: {
					request: {
						method: 'GET',
						url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}/templates/{{$parameter.templateId}}',
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
		displayOptions: { show: showOnlyForAnyTemplateOperation },
	},
	{
		displayName: 'Type ID',
		name: 'typeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAnyTemplateOperation },
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForTemplateGet },
	},

	...paginationFields(showOnlyForTemplatesGetAll),
];
