import type { INodeProperties } from 'n8n-workflow';
import { Colors, FilterConditions, PropertyFormats, SortProperties } from '../generated/spec';

type Show = { [key: string]: string[] };

const VALUE_HINT =
	'For multi-select, files and objects: comma-separated tag keys/IDs or object IDs. For date: RFC3339 or YYYY-MM-DD.';

/** Property key/format/value rows for Object create & update (Simple mode). */
export function propertyValuesField(show: Show): INodeProperties {
	return {
		displayName: 'Properties',
		name: 'properties',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		displayOptions: { show },
		placeholder: 'Add Property',
		description: 'Property values to set on the object, by property key',
		options: [
			{
				displayName: 'Property',
				name: 'property',
				values: [
					{
						displayName: 'Property Key',
						name: 'key',
						type: 'string',
						default: '',
						required: true,
						typeOptions: { loadOptionsMethod: 'getPropertyKeys', loadOptionsDependsOn: ['spaceId'] },
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [...PropertyFormats],
						default: '',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'boolean',
						default: false,
						displayOptions: { show: { format: ['checkbox'] } },
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: { hide: { format: ['checkbox'] } },
						description: VALUE_HINT,
					},
				],
			},
		],
	};
}

/** Filter rows for Search (Simple mode); combined with AND. */
export function filtersField(show: Show): INodeProperties {
	return {
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		displayOptions: { show },
		placeholder: 'Add Filter',
		description: 'Conditions combined with AND; use JSON mode for nested OR logic',
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Property Key',
						name: 'property_key',
						type: 'string',
						default: '',
						required: true,
						typeOptions: { loadOptionsMethod: 'getPropertyKeys', loadOptionsDependsOn: ['spaceId'] },
					},
					{
						displayName: 'Condition',
						name: 'condition',
						type: 'options',
						options: [...FilterConditions],
						default: '',
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [...PropertyFormats],
						default: '',
						displayOptions: { hide: { condition: ['empty', 'nempty'] } },
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: { hide: { condition: ['empty', 'nempty'] } },
						description: VALUE_HINT,
					},
				],
			},
		],
	};
}

/** Sort dropdowns for Search (Simple mode). */
export function sortFields(show: Show): INodeProperties[] {
	return [
		{
			displayName: 'Sort By',
			name: 'sortBy',
			type: 'options',
			options: [...SortProperties],
			default: '',
			displayOptions: { show },
		},
		{
			displayName: 'Sort Direction',
			name: 'sortDirection',
			type: 'options',
			options: [
				{ name: 'Ascending', value: 'asc' },
				{ name: 'Descending', value: 'desc' },
			],
			default: 'desc',
			displayOptions: { show },
		},
	];
}

/** Tag color dropdown (spec Color enum). */
export function colorField(show: Show, required = false): INodeProperties {
	return {
		displayName: 'Color',
		name: 'color',
		type: 'options',
		options: [...Colors],
		default: '',
		required,
		displayOptions: { show },
	};
}

/** Simple text/textarea field. */
export function textField(name: string, label: string, show: Show, options?: Partial<INodeProperties>): INodeProperties {
	return {
		displayName: label,
		name,
		type: 'string',
		default: '',
		displayOptions: { show },
		...options,
	};
}
