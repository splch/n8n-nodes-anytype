import { propertyValuesFromRows, typedValue, simplifyObjectJson } from '../nodes/Anytype/shared/buildResource';
import type { IDataObject } from 'n8n-workflow';

describe('typedValue (property codec)', () => {
	it('passes scalars through by format', () => {
		expect(typedValue('text', 'hello')).toEqual({ field: 'text', value: 'hello' });
		expect(typedValue('url', 'https://a.b')).toEqual({ field: 'url', value: 'https://a.b' });
		expect(typedValue('date', '2026-01-01')).toEqual({ field: 'date', value: '2026-01-01' });
	});

	it('coerces numbers and drops non-numeric input', () => {
		expect(typedValue('number', '42')).toEqual({ field: 'number', value: 42 });
		expect(typedValue('number', 3.5)).toEqual({ field: 'number', value: 3.5 });
		expect(typedValue('number', 'abc')).toBeNull();
	});

	it('coerces checkbox strings and booleans', () => {
		expect(typedValue('checkbox', 'true')).toEqual({ field: 'checkbox', value: true });
		expect(typedValue('checkbox', true)).toEqual({ field: 'checkbox', value: true });
		expect(typedValue('checkbox', 'false')).toEqual({ field: 'checkbox', value: false });
		expect(typedValue('checkbox', false)).toEqual({ field: 'checkbox', value: false });
	});

	it('splits list formats on commas, trimming and dropping empties', () => {
		expect(typedValue('multi_select', 'a, b ,,c')).toEqual({
			field: 'multi_select',
			value: ['a', 'b', 'c'],
		});
		expect(typedValue('objects', '')).toBeNull();
		expect(typedValue('files', ' , ')).toBeNull();
	});

	it('drops empty scalar values instead of clobbering with falsy', () => {
		expect(typedValue('text', '')).toBeNull();
		expect(typedValue('text', undefined)).toBeNull();
		expect(typedValue('text', null)).toBeNull();
	});
});

describe('propertyValuesFromRows', () => {
	it('builds spec-shaped property values', () => {
		const rows = [
			{ key: 'status', format: 'select', value: 'done' } as IDataObject,
			{ key: 'priority', format: 'number', value: '3' } as IDataObject,
			{ key: '', format: 'text', value: 'ignored' } as IDataObject,
		];
		expect(propertyValuesFromRows(rows)).toEqual([
			{ key: 'status', select: 'done' },
			{ key: 'priority', number: 3 },
		]);
	});
});

describe('simplifyObjectJson (inverse of the codec)', () => {
	it('flattens object payloads with scalar property values', () => {
		const obj = {
			id: 'o1',
			name: 'Invoice',
			layout: 'basic',
			space_id: 's1',
			type: { key: 'page' },
			properties: [
				{ key: 'status', format: 'select', select: { id: 't1', name: 'Done' } },
				{ key: 'tags', format: 'multi_select', multi_select: [{ name: 'A' }, { name: 'B' }] },
				{ key: 'count', format: 'number', number: 2 },
				{ key: 'done', format: 'checkbox', checkbox: true },
			],
		} as unknown as IDataObject;
		const out = simplifyObjectJson(obj);
		expect(out).toEqual({
			id: 'o1',
			name: 'Invoice',
			layout: 'basic',
			space_id: 's1',
			type: 'page',
			properties: { status: 'Done', tags: ['A', 'B'], count: 2, done: true },
		});
	});

	it('unwraps { object: {...} } envelopes', () => {
		const wrapped = { object: { id: 'o2', name: 'N' } } as unknown as IDataObject;
		expect(simplifyObjectJson(wrapped).id).toBe('o2');
	});

	it('maps list entries to tag names or ids when objects', () => {
		const obj = {
			id: 'o3',
			properties: [{ key: 't', format: 'multi_select', multi_select: [{ id: 'x' }] }],
		} as unknown as IDataObject;
		expect((simplifyObjectJson(obj).properties as IDataObject).t).toEqual(['x']);
	});
});
