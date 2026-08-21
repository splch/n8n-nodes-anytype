#!/usr/bin/env node
// Check for a newer Anytype OpenAPI spec; if found, regenerate
// nodes/Anytype/generated/spec.ts and bump the pinned apiVersion.
// Used by .github/workflows/update-spec.yml; also runnable locally.
//
// Exit codes: 0 = ok (see JSON summary), 1 = error.
// Prints a JSON summary on the last line for the workflow to consume.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CREDS_FILE = join(ROOT, 'credentials/AnytypeApi.credentials.ts');
const SPEC_TS = join(ROOT, 'nodes/Anytype/generated/spec.ts');
const API_BASE = 'https://api.github.com/repos/anyproto/anytype-api/contents/docs/reference';
const RAW_BASE = 'https://raw.githubusercontent.com/anyproto/anytype-api/main/docs/reference';

const ENUMS = {
	PropertyFormats: 'PropertyFormat',
	Colors: 'Color',
	FilterConditions: 'FilterCondition',
	SortProperties: 'SortProperty',
	TypeLayouts: 'TypeLayout',
};

const LABEL_OVERRIDES = { eq: 'Equal', ne: 'Not Equal', gt: 'Greater Than', gte: 'Greater or Equal', lt: 'Less Than', lte: 'Less or Equal', contains: 'Contains', ncontains: 'Does Not Contain', in: 'In', nin: 'Not In', all: 'Contains All', empty: 'Is Empty', nempty: 'Is Not Empty', url: 'URL', asc: 'Ascending', desc: 'Descending' };

function labelize(value) {
	if (LABEL_OVERRIDES[value]) return LABEL_OVERRIDES[value];
	return value.split(/[-_]+/).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

async function fetchJson(url) {
	const res = await fetch(url, { headers: { 'User-Agent': 'n8n-nodes-anytype' } });
	if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
	return res.json();
}

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
	return res.text();
}

async function main() {
	const creds = await readFile(CREDS_FILE, 'utf8');
	const pinned = creds.match(/name:\s*'apiVersion'[\s\S]*?default:\s*'(\d{4}-\d{2}-\d{2})'/)?.[1];
	if (!pinned) throw new Error('apiVersion default not found in credentials file');

	// Discover available spec versions.
	const listing = await fetchJson(API_BASE);
	const versions = listing
		.map((f) => f.name.match(/^openapi-(\d{4}-\d{2}-\d{2})\.yaml$/)?.[1])
		.filter(Boolean)
		.sort();
	const latest = versions.at(-1);
	if (!latest || latest <= pinned) {
		console.log(`Pinned version ${pinned} is up to date (latest available: ${latest}).`);
		console.log(JSON.stringify({ updated: false, pinned, latest }));
		return;
	}

	// Fetch the new spec.
	const spec = parseYaml(await fetchText(`${RAW_BASE}/openapi-${latest}.yaml`));
	const schemas = spec.components?.schemas ?? {};
	const specRoutes = new Set();
	for (const [path, ops] of Object.entries(spec.paths ?? {})) {
		for (const verb of ['get', 'post', 'patch', 'put', 'delete']) {
			if (ops?.[verb]) specRoutes.add(`${verb.toUpperCase()} ${path.replace(/^\/v1/, '')}`);
		}
	}

	// Keep currently implemented routes that still exist; report the rest.
	const specTs = await readFile(SPEC_TS, 'utf8');
	const current = [...specTs.matchAll(/^\t'(?:GET|POST|PATCH|PUT|DELETE) [^']+'/gm)].map((m) =>
		m[0].trim().slice(1, -1),
	);
	const kept = current.filter((r) => specRoutes.has(r));
	const removed = current.filter((r) => !specRoutes.has(r));
	const added = [...specRoutes].filter((r) => !current.includes(r)).sort();

	const lines = [
		'/* eslint-disable */',
		'// Data extracted from the Anytype OpenAPI spec, version ' + latest + '.',
		'// Update with: npm run update-spec',
		'',
		`export const API_VERSION = '${latest}';`,
		'',
	];
	for (const [exportName, schemaName] of Object.entries(ENUMS)) {
		const values = schemas[schemaName]?.enum;
		if (!Array.isArray(values)) throw new Error(`Enum ${schemaName} not found in spec ${latest}`);
		lines.push(`export const ${exportName} = [`);
		for (const v of values) lines.push(`\t{ name: '${labelize(v)}', value: '${v}' },`);
		lines.push('] as const;', '');
	}
	lines.push(
		'// Routes implemented by this node (all present in the pinned spec).',
		'// scripts/check-drift.mjs compares this list against the resource files.',
		'export const IMPLEMENTED_ROUTES = [',
		...kept.map((r) => `\t'${r}',`),
		'] as const;',
		'',
		'// Spec routes intentionally not implemented:',
		'//   POST /spaces/{space_id}/files            (binary upload - use the HTTP Request node)',
		'//   GET|DELETE /spaces/{space_id}/files/{id}',
		'//   GET  /spaces/{space_id}/chats/{chat_id}/messages/stream (SSE)',
		'//   POST /auth/challenges, POST /auth/api_keys (only needed to obtain the API key)',
		'',
	);

	await writeFile(SPEC_TS, lines.join('\n'));
	await writeFile(CREDS_FILE, creds.replaceAll(`'${pinned}'`, `'${latest}'`));

	const summary = { updated: true, from: pinned, to: latest, removed, added };
	console.log(`Updated spec ${pinned} -> ${latest}: ${removed.length} routes removed, ${added.length} new routes.`);
	console.log(JSON.stringify(summary));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
