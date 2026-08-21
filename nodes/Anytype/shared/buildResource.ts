/* eslint-disable n8n-nodes-base/node-param-default-missing -- operation defaults come from ResourceConfig */
import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

type Ctx = IExecuteSingleFunctions;
type Show = { [key: string]: string[] };
type PreSend = (this: Ctx, requestOptions: IHttpRequestOptions) => Promise<IHttpRequestOptions>;

// ---------------------------------------------------------------------------
// preSend body builders (Simple mode; JSON mode routes jsonBody as-is)
// ---------------------------------------------------------------------------

const LIST_FORMATS = new Set(['multi_select', 'files', 'objects']);

function typedValue(format: string, raw: unknown): { field: string; value: IDataObject[string] } | null {
	if (LIST_FORMATS.has(format)) {
		const list = String(raw ?? '').split(',').map((v) => v.trim()).filter(Boolean);
		return list.length ? { field: format, value: list } : null;
	}
	switch (format) {
		case 'number': {
			const n = Number(raw);
			return Number.isNaN(n) ? null : { field: 'number', value: n };
		}
		case 'checkbox':
			return { field: 'checkbox', value: raw === true || raw === 'true' };
		default:
			return raw === '' || raw === undefined || raw === null
				? null
				: { field: format, value: String(raw) };
	}
}

function rows(ctx: Ctx, name: string): IDataObject[] {
	const param = ctx.getNodeParameter(name, {}) as IDataObject;
	return Object.values(param ?? {}) as IDataObject[];
}

function propertyValues(ctx: Ctx): IDataObject[] {
	return rows(ctx, 'properties')
		.map((row) => {
			const key = String(row.key ?? '').trim();
			const tv = key && typedValue(String(row.format ?? 'text'), row.value);
			return tv ? { key, [tv.field]: tv.value } : null;
		})
		.filter(Boolean) as IDataObject[];
}

function isJsonMode(ctx: Ctx): boolean {
	return ctx.getNodeParameter('bodyMode', 'simple') === 'json';
}

function useJsonBody(ctx: Ctx, req: IHttpRequestOptions): IHttpRequestOptions {
	const raw = ctx.getNodeParameter('jsonBody', '{}');
	req.body = typeof raw === 'string' ? (JSON.parse(raw || '{}') as IDataObject) : raw;
	return req;
}

/** Wrap a simple-mode body builder so JSON mode parses jsonBody instead. */
function withJsonBody(simple: PreSend): PreSend {
	return async function (this: Ctx, req: IHttpRequestOptions) {
		return isJsonMode(this) ? useJsonBody(this, req) : simple.call(this, req);
	};
}

/**
 * Unwrap a response envelope ({ data: [...] }, { object: {...} }, ...) into
 * items. Unlike the declarative rootProperty action, an empty payload yields
 * one empty item instead of failing the run with "No item to return".
 */
function unwrapOrEmpty(property: string) {
	return async function (
		this: Ctx,
		items: INodeExecutionData[],
		response: { body: unknown },
	): Promise<INodeExecutionData[]> {
		const body = response.body as IDataObject;
		const payload = body?.[property];
		if (Array.isArray(payload)) {
			const unwrapped = (payload as IDataObject[]).map((entry) => ({ json: entry }));
			return unwrapped.length ? unwrapped : [{ json: {} }];
		}
		if (payload && typeof payload === 'object') return [{ json: payload as IDataObject }];
		return items.length ? items : [{ json: {} }];
	};
}

/** PreSend for raw-JSON-only operations. */
export async function jsonBodyOnly(this: Ctx, req: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	return useJsonBody(this, req);
}

/** CreateObjectRequest: type_key, name, body, template_id, properties. */
export async function createObjectBody(this: Ctx, req: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	const body: IDataObject = { type_key: this.getNodeParameter('typeKey') };
	const name = this.getNodeParameter('name', '') as string;
	if (name) body.name = name;
	const markdown = this.getNodeParameter('markdown', '') as string;
	if (markdown) body.body = markdown;
	const templateId = this.getNodeParameter('templateId', '') as string;
	if (templateId) body.template_id = templateId;
	const properties = propertyValues(this);
	if (properties.length) body.properties = properties;
	req.body = body;
	return req;
}

/** UpdateObjectRequest: name, markdown, type_key, properties. */
export async function updateObjectBody(this: Ctx, req: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	const body: IDataObject = {};
	const name = this.getNodeParameter('name', '') as string;
	if (name) body.name = name;
	const markdown = this.getNodeParameter('markdown', '') as string;
	if (markdown) body.markdown = markdown;
	const typeKey = this.getNodeParameter('typeKey', '') as string;
	if (typeKey) body.type_key = typeKey;
	const properties = propertyValues(this);
	if (properties.length) body.properties = properties;
	req.body = body;
	return req;
}

/** SearchRequest: query, types, sort, AND-combined filter conditions. */
export async function searchBody(this: Ctx, req: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	const body: IDataObject = {};
	const query = this.getNodeParameter('query', '') as string;
	if (query) body.query = query;
	const types = this.getNodeParameter('typeKeys', []) as string[];
	if (types.length) body.types = types;
	const sortBy = (this.getNodeParameter('sortBy', '') as string) || 'last_modified_date';
	if (sortBy) {
		body.sort = {
			property_key: sortBy,
			direction: (this.getNodeParameter('sortDirection', '') as string) || 'desc',
		} as IDataObject;
	}
	const conditions = rows(this, 'filters')
		.map((row) => {
			const propertyKey = String(row.property_key ?? '').trim();
			if (!propertyKey) return null;
			const condition = String(row.condition ?? 'eq');
			const out: IDataObject = { property_key: propertyKey, condition };
			if (condition !== 'empty' && condition !== 'nempty') {
				const tv = typedValue(String(row.format ?? 'text'), row.value);
				if (tv) out[tv.field] = tv.value;
			}
			return out;
		})
		.filter(Boolean) as IDataObject[];
	if (conditions.length) body.filters = { operator: 'and', conditions };
	req.body = body;
	return req;
}

/** Assemble a body from a { paramName: bodyKey } map, dropping empty values. */
export function bodyFrom(map: Record<string, string>): PreSend {
	return async function (this: Ctx, req: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		const body: IDataObject = {};
		for (const [param, key] of Object.entries(map)) {
			const value = this.getNodeParameter(param, '') as unknown;
			if (value !== '' && value !== undefined && value !== null) body[key] = value;
		}
		req.body = body;
		return req;
	};
}

// ---------------------------------------------------------------------------
// Resource builder
// ---------------------------------------------------------------------------

export interface Op {
	value: string;
	name: string;
	method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	/** URL with n8n expressions, e.g. '=/spaces/{{$parameter.spaceId}}/objects'. */
	url: string;
	description?: string;
	/** Response envelope key to unwrap into items ('data', 'object', ...). */
	unwrap?: string;
	/** Adds Return All / Limit params wired to offset pagination. */
	paginated?: boolean;
	/** 'json': raw JSON body. Otherwise: Simple/JSON toggle; simple fields assembled by preSend. */
	body?: 'json' | { fields: (show: Show) => INodeProperties[]; preSend: PreSend };
	bodyDescription?: string;
}

export interface IdParam {
	name: string;
	label: string;
	ops: string[];
	loader?: string;
	dependsOn?: string[];
	description?: string;
}

export interface ResourceConfig {
	resource: string;
	defaultOperation: string;
	operations: Op[];
	idParams?: IdParam[];
	/** Extra fields appended verbatim (own displayOptions, e.g. query params). */
	fields?: INodeProperties[];
}

const LIST_MAX = 1000;
const PAGE_SIZE = 100;

export function buildResource(config: ResourceConfig): INodeProperties[] {
	const { resource } = config;
	const out: INodeProperties[] = [];
	const paginatedOps: string[] = [];

	out.push({
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options: config.operations.map((op) => {
			if (op.paginated) paginatedOps.push(op.value);
			return {
				name: op.name,
				value: op.value,
				action: op.name,
				description: op.description,
				routing: {
					// Body is always assembled by preSend (simple fields or parsed jsonBody).
					request: { method: op.method, url: op.url },
					send: op.body
						? { preSend: [op.body === 'json' ? jsonBodyOnly : withJsonBody(op.body.preSend)] }
						: undefined,
					output: op.unwrap
						? { postReceive: [unwrapOrEmpty(op.unwrap)] }
						: undefined,
					},
			};
		}),
		default: config.defaultOperation,
	});

	for (const p of config.idParams ?? []) {
		out.push({
			displayName: p.label,
			name: p.name,
			type: 'string',
			required: true,
			default: '',
			displayOptions: { show: { resource: [resource], operation: p.ops } },
			description: p.description,
			typeOptions: p.loader ? { loadOptionsMethod: p.loader, loadOptionsDependsOn: p.dependsOn ?? [] } : undefined,
		});
	}

	for (const op of config.operations) {
		if (!op.body) continue;
		const show = { resource: [resource], operation: [op.value] };
		const jsonField: INodeProperties = {
			displayName: 'Body (JSON)',
			name: 'jsonBody',
			type: 'json',
			required: true,
			default: '{}',
			displayOptions: { show: op.body === 'json' ? show : { ...show, bodyMode: ['json'] } },
			description: op.bodyDescription ?? 'Request body as JSON (see Anytype API docs)',
		};
		if (op.body === 'json') {
			out.push(jsonField);
		} else {
			out.push({
				displayName: 'Body Mode',
				name: 'bodyMode',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show },
				options: [
					{ name: 'Simple', value: 'simple' },
					{ name: 'JSON', value: 'json' },
				],
				default: 'simple',
				description: 'Simple: fill in fields. JSON: provide the raw request body.',
			});
			out.push(...op.body.fields({ ...show, bodyMode: ['simple'] }));
			out.push(jsonField);
		}
	}

	if (paginatedOps.length) {
		const show = { resource: [resource], operation: paginatedOps };
		out.push(
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show },
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				routing: {
					send: { paginate: '={{ $value }}' },
					operations: {
						pagination: {
							type: 'offset',
							properties: { limitParameter: 'limit', offsetParameter: 'offset', pageSize: PAGE_SIZE, type: 'query' },
						},
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { ...show, returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: LIST_MAX },
				default: 50,
				description: 'Max number of results to return',
				routing: {
					send: { type: 'query', property: 'limit' },
					output: { maxResults: '={{$value}}' },
				},
			},
		);
	}

	out.push(...(config.fields ?? []));
	return out;
}
