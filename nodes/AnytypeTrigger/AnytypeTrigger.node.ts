import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { getLists, getSpaces, getTypes } from '../Anytype/shared/loadOptions';
import { simplifyObjectJson } from '../Anytype/shared/buildResource';

// ---------------------------------------------------------------------------
// Polling helpers
// ---------------------------------------------------------------------------

const FIRST_PAGE = { limit: 100 };

async function apiFetch(
	ctx: IPollFunctions,
	method: 'GET' | 'POST',
	path: string,
	body?: IDataObject,
	qs: IDataObject = {},
): Promise<IDataObject> {
	const creds = await ctx.getCredentials('anytypeApi');
	const baseUrl = String(creds.baseUrl || 'http://127.0.0.1:31009/v1').replace(/\/$/, '');
	return (await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'anytypeApi', {
		method,
		url: `${baseUrl}${path}`,
		headers: { 'Anytype-Version': String(creds.apiVersion || '2025-11-08') },
		body,
		qs,
		json: true,
	})) as IDataObject;
}

/** First page of objects in a list view, newest-modified first. */
export async function fetchListObjects(
	ctx: IPollFunctions,
	spaceId: string,
	listId: string,
	viewId: string,
): Promise<IDataObject[]> {
	const res = await apiFetch(
		ctx,
		'GET',
		`/spaces/${spaceId}/lists/${listId}/views/${viewId}/objects`,
		undefined,
		FIRST_PAGE,
	);
	return Array.isArray(res.data) ? (res.data as IDataObject[]) : [];
}

/** First page of space-search hits for a type, newest-modified first. */
export async function fetchTypeObjects(
	ctx: IPollFunctions,
	spaceId: string,
	typeKey: string,
): Promise<IDataObject[]> {
	const res = await apiFetch(ctx, 'POST', `/spaces/${spaceId}/search`, {
		types: [typeKey],
		sort: { property_key: 'last_modified_date', direction: 'desc' },
	});
	return Array.isArray(res.data) ? (res.data as IDataObject[]) : [];
}

// ---------------------------------------------------------------------------
// Dedup state transitions (pure; unit-tested)
// ---------------------------------------------------------------------------

export const SEEN_IDS_CAP = 1000;

/**
 * Emit objects whose ids haven't been seen before; first poll establishes
 * the baseline without emitting. Edited objects never re-emit because their
 * id is already tracked. Ids are FIFO-capped; an object evicted after heavy
 * churn could re-emit once, which is preferable to unbounded state.
 */
export function nextSeenState(
	previous: { seenIds: string[] } | undefined,
	objects: IDataObject[],
): { newObjects: IDataObject[]; state: { seenIds: string[] } } {
	const seen = new Set(previous?.seenIds ?? []);
	const newObjects = previous ? objects.filter((o) => !seen.has(String(o.id))) : [];
	const allIds = previous ? newObjects.map((o) => String(o.id)) : objects.map((o) => String(o.id));
	const seenIds = [...seen, ...allIds].slice(-SEEN_IDS_CAP);
	return { newObjects, state: { seenIds } };
}

function toItems(objects: IDataObject[], simplify: boolean): INodeExecutionData[] {
	return objects.map((o) => ({ json: simplify ? simplifyObjectJson(o) : o }));
}

// ---------------------------------------------------------------------------
// Node
// ---------------------------------------------------------------------------

export class AnytypeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Anytype Trigger',
		name: 'anytypeTrigger',
		icon: { light: 'file:anytype.svg', dark: 'file:anytype.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Polls Anytype for new objects',
		defaults: { name: 'Anytype Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'anytypeApi', required: true }],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Object Added to List',
						value: 'objectAddedToList',
						description: 'Emit when an object is added to a list (collection or set)',
					},
					{
						name: 'Object Created of Type',
						value: 'objectCreatedOfType',
						description: 'Emit the first time an object of the chosen type is seen in a space',
					},
				],
				default: 'objectCreatedOfType',
			},
			{
				displayName: 'Space Name or ID',
				name: 'spaceId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				required: true,
				default: '',
				typeOptions: { loadOptionsMethod: 'getSpaces' },
			},
			{
				displayName: 'Type Name or ID',
				name: 'typeKey',
				type: 'options',
				required: true,
				default: '',
				displayOptions: { show: { event: ['objectCreatedOfType'] } },
				typeOptions: { loadOptionsMethod: 'getTypes', loadOptionsDependsOn: ['spaceId'] },
				description: 'Choose from the list, or specify a type key using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'List Name or ID',
				name: 'listId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				required: true,
				default: '',
				displayOptions: { show: { event: ['objectAddedToList'] } },
				typeOptions: { loadOptionsMethod: 'getLists', loadOptionsDependsOn: ['spaceId'] },
			},
			{
				displayName: 'View Name or ID',
				name: 'viewId',
				type: 'options',
				required: true,
				default: '',
				displayOptions: { show: { event: ['objectAddedToList'] } },
				typeOptions: { loadOptionsMethod: 'getViews', loadOptionsDependsOn: ['spaceId', 'listId'] },
				description: 'List view whose objects are polled (usually "All"). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: true,
				description:
					'Whether to return a flattened version of each object instead of the raw API response',
			},
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getSpaces(this);
			},
			async getTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getTypes(this);
			},
			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getLists(this);
			},
			async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const spaceId = String(this.getCurrentNodeParameter('spaceId') ?? '');
				const listId = String(this.getCurrentNodeParameter('listId') ?? '');
				if (!spaceId || !listId) return [];
				const creds = await this.getCredentials('anytypeApi');
				const baseUrl = String(creds.baseUrl || 'http://127.0.0.1:31009/v1').replace(/\/$/, '');
				const res = (await this.helpers.httpRequestWithAuthentication.call(this, 'anytypeApi', {
					method: 'GET',
					url: `${baseUrl}/spaces/${spaceId}/lists/${listId}/views`,
					headers: { 'Anytype-Version': String(creds.apiVersion || '2025-11-08') },
					qs: { limit: 100 },
					json: true,
				})) as IDataObject;
				const views = Array.isArray(res.data) ? (res.data as IDataObject[]) : [];
				return views
					.filter((v) => v.id)
					.map((v) => ({ name: String(v.name ?? v.id), value: String(v.id) }));
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const spaceId = this.getNodeParameter('spaceId') as string;
		const simplify = this.getNodeParameter('simplify', true) as boolean;
		const staticData = this.getWorkflowStaticData('node');

		if (event === 'objectAddedToList') {
			const listId = this.getNodeParameter('listId') as string;
			const viewId = this.getNodeParameter('viewId') as string;
			const objects = await fetchListObjects(this, spaceId, listId, viewId);
			const { newObjects, state } = nextSeenState(
				staticData.seen as { seenIds: string[] } | undefined,
				objects,
			);
			staticData.seen = state;
			return newObjects.length ? [toItems(newObjects, simplify)] : null;
		}

		const typeKey = this.getNodeParameter('typeKey') as string;
		const objects = await fetchTypeObjects(this, spaceId, typeKey);
		const { newObjects, state } = nextSeenState(
			staticData.seenByType as { seenIds: string[] } | undefined,
			objects,
		);
		staticData.seenByType = state;
		return newObjects.length ? [toItems(newObjects, simplify)] : null;
	}
}
