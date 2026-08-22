import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

// Design-time dropdown loaders: fetch live data with the node's credentials.
// Each loader returns [] when its dependencies (e.g. spaceId) aren't set yet.

type Item = Record<string, unknown>;

function param(ctx: ILoadOptionsFunctions, name: string): string {
	try {
		const v = ctx.getCurrentNodeParameter(name) as unknown;
		if (typeof v === 'string') return v;
		if (v && typeof v === 'object' && 'value' in (v as object)) return String((v as { value: unknown }).value);
	} catch { /* not set */ }
	return '';
}

const PAGE_SIZE = 100;
// Safety cap so pickers don't try to render thousands of options.
const MAX_ITEMS = 500;

async function get(ctx: ILoadOptionsFunctions, path: string): Promise<Record<string, unknown>> {
	const creds = await ctx.getCredentials('anytypeApi');
	const baseUrl = String(creds.baseUrl || 'http://127.0.0.1:31009/v1').replace(/\/$/, '');
	const headers = { 'Anytype-Version': String(creds.apiVersion || '2025-11-08') };
	const first = (await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'anytypeApi', {
		method: 'GET',
		url: `${baseUrl}${path}`,
		headers,
		qs: { offset: 0, limit: PAGE_SIZE },
		json: true,
	})) as Record<string, unknown>;
	const data = Array.isArray(first.data) ? [...(first.data as unknown[])] : [];
	const pagination = first.pagination as Record<string, unknown> | undefined;
	let offset = data.length;
	while (pagination?.has_more === true && data.length < MAX_ITEMS) {
		const page = (await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'anytypeApi', {
			method: 'GET',
			url: `${baseUrl}${path}`,
			headers,
			qs: { offset, limit: PAGE_SIZE },
			json: true,
		})) as Record<string, unknown>;
		const items = Array.isArray(page.data) ? (page.data as unknown[]) : [];
		if (!items.length) break;
		data.push(...items);
		offset += items.length;
	}
	return { ...first, data };
}

function options(
	items: unknown,
	label: (i: Item) => unknown = (i) => i.name,
	value: (i: Item) => unknown = (i) => i.id,
): INodePropertyOptions[] {
	if (!Array.isArray(items)) return [];
	return items
		.filter((i) => i && typeof i === 'object' && value(i as Item))
		.map((i) => ({ name: String(label(i as Item)), value: String(value(i as Item)) }));
}

async function listTypes(ctx: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const spaceId = param(ctx, 'spaceId');
	if (!spaceId) return [];
	return options((await get(ctx, `/spaces/${spaceId}/types`)).data);
}

// Named exports so the trigger node can reuse these loaders.
export async function getSpaces(ctx: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return options((await get(ctx, '/spaces')).data);
}

export async function getTypes(ctx: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return listTypes(ctx);
}

// Lists are objects with a collection/set layout; sorted to the top.
export async function getLists(ctx: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const spaceId = param(ctx, 'spaceId');
	if (!spaceId) return [];
	const items = (await get(ctx, `/spaces/${spaceId}/objects`)).data;
	if (!Array.isArray(items)) return [];
	const all = items as Item[];
	const lists = all.filter((o) => o.layout === 'collection' || o.layout === 'set');
	return options([...lists, ...all.filter((o) => !lists.includes(o))]);
}

export const loadOptionsMethods = {
	async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		return getSpaces(this);
	},

	async getTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		return getTypes(this);
	},

	async getTypeKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const opts = await listTypes(this).then((list) => list); // ids
		const spaceId = param(this, 'spaceId');
		if (!spaceId) {
			return ['page', 'note', 'task', 'bookmark', 'set', 'collection'].map((k) => ({
				name: k[0].toUpperCase() + k.slice(1),
				value: k,
			}));
		}
		const res = await get(this, `/spaces/${spaceId}/types`);
		const byKey = options(res.data, (t) => t.name, (t) => t.key);
		return byKey.length ? byKey : opts;
	},

	async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		const typeId = param(this, 'typeId');
		if (spaceId && typeId) {
			return options((await get(this, `/spaces/${spaceId}/types/${typeId}/templates`)).data);
		}
		// No type selected (Object Create): list templates across all types, prefixed by type name.
		if (!spaceId) return [];
		const out: INodePropertyOptions[] = [];
		for (const type of await listTypes(this)) {
			const res = await get(this, `/spaces/${spaceId}/types/${type.value}/templates`);
			out.push(...options(res.data, (t) => `${type.name}: ${t.name}`));
		}
		return out;
	},

	async getProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		if (!spaceId) return [];
		return options((await get(this, `/spaces/${spaceId}/properties`)).data);
	},

	async getPropertyKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		if (!spaceId) return [];
		return options((await get(this, `/spaces/${spaceId}/properties`)).data, (p) => p.name, (p) => p.key);
	},

	async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		const propertyId = param(this, 'propertyId');
		if (!spaceId || !propertyId) return [];
		return options((await get(this, `/spaces/${spaceId}/properties/${propertyId}/tags`)).data);
	},

	async getObjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		if (!spaceId) return [];
		return options((await get(this, `/spaces/${spaceId}/objects`)).data);
	},

	async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		return getLists(this);
	},

	async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		const listId = param(this, 'listId');
		if (!spaceId || !listId) return [];
		return options((await get(this, `/spaces/${spaceId}/lists/${listId}/views`)).data);
	},

	async getMembers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		if (!spaceId) return [];
		return options((await get(this, `/spaces/${spaceId}/members`)).data, (m) => m.name ?? m.global_name);
	},

	async getChats(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const spaceId = param(this, 'spaceId');
		if (!spaceId) return [];
		return options((await get(this, `/spaces/${spaceId}/chats`)).data);
	},
};
