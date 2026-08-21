import type { INodeProperties } from 'n8n-workflow';
import { buildResource } from '../../shared/buildResource';

export const templatesDescription: INodeProperties[] = buildResource({
	resource: 'template',
	defaultOperation: 'getAll',
	operations: [
		{
			value: 'getAll',
			name: 'Get Many',
			description: 'List templates for a type',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}/templates',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'get',
			name: 'Get',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/types/{{$parameter.typeId}}/templates/{{$parameter.templateId}}',
			unwrap: 'template',
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ['getAll', 'get'], loader: 'getSpaces' },
		{ name: 'typeId', label: 'Type', ops: ['getAll', 'get'], loader: 'getTypes', dependsOn: ['spaceId'] },
		{ name: 'templateId', label: 'Template', ops: ['get'], loader: 'getTemplates', dependsOn: ['spaceId', 'typeId'] },
	],
});
