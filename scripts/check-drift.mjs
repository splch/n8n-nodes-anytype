#!/usr/bin/env node
// Compare the node's HTTP routes against Anytype's pinned OpenAPI spec.
// Fails (exit 1) if the node calls endpoints absent from the spec.
// Logs (no fail) endpoints in the spec the node hasn't implemented.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NODE_FILE = join(ROOT, 'nodes/Anytype/Anytype.node.ts');
const RESOURCES_DIR = join(ROOT, 'nodes/Anytype/resources');
const CREDS_FILE = join(ROOT, 'credentials/AnytypeApi.credentials.ts');
const SPEC_BASE =
	'https://raw.githubusercontent.com/anyproto/anytype-api/main/docs/reference';

const VERBS = ['get', 'post', 'patch', 'put', 'delete'];

function canonical(path) {
	return path
		.replace(/^=/, '')
		.replace(/^\/v1/, '')
		.replace(/\{\{\$parameter\.([^}]+)\}\}/g, '{$1}')
		.replace(/\{[^}]+\}/g, '{}');
}

async function readPinnedVersion() {
	const text = await readFile(CREDS_FILE, 'utf8');
	const m = text.match(
		/name:\s*'apiVersion'[\s\S]*?default:\s*'(\d{4}-\d{2}-\d{2})'/,
	);
	if (!m) throw new Error(`apiVersion default not found in ${CREDS_FILE}`);
	return m[1];
}

async function activeResourceDirs() {
	const text = await readFile(NODE_FILE, 'utf8');
	const re = /from\s+['"]\.\/resources\/([^/'"]+)['"]/g;
	return [...text.matchAll(re)].map((m) => m[1]);
}

async function* walkTs(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) yield* walkTs(p);
		else if (entry.isFile() && p.endsWith('.ts')) yield p;
	}
}

async function extractNodeRoutes() {
	const dirs = await activeResourceDirs();
	const re =
		/method:\s*'(GET|POST|PATCH|PUT|DELETE)'[\s\S]{0,400}?url:\s*'([^']+)'/g;
	const routes = new Set();
	for (const dir of dirs) {
		for await (const file of walkTs(join(RESOURCES_DIR, dir))) {
			const text = await readFile(file, 'utf8');
			for (const m of text.matchAll(re)) {
				routes.add(`${m[1]} ${canonical(m[2])}`);
			}
		}
	}
	return routes;
}

function extractSpecRoutes(spec) {
	const routes = new Set();
	for (const [path, ops] of Object.entries(spec.paths || {})) {
		for (const verb of VERBS) {
			if (ops?.[verb]) routes.add(`${verb.toUpperCase()} ${canonical(path)}`);
		}
	}
	return routes;
}

async function fetchSpec(version) {
	const url = `${SPEC_BASE}/openapi-${version}.yaml`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
	return parseYaml(await res.text());
}

async function main() {
	const version = await readPinnedVersion();
	console.log(`Pinned Anytype API version: ${version}`);

	const [spec, nodeRoutes] = await Promise.all([
		fetchSpec(version),
		extractNodeRoutes(),
	]);
	const specRoutes = extractSpecRoutes(spec);

	const missingInSpec = [...nodeRoutes].filter((r) => !specRoutes.has(r)).sort();
	const missingInNode = [...specRoutes].filter((r) => !nodeRoutes.has(r)).sort();

	console.log(
		`Node routes: ${nodeRoutes.size}  Spec operations: ${specRoutes.size}`,
	);

	if (missingInNode.length) {
		console.log(`\nSpec endpoints not implemented (${missingInNode.length}):`);
		for (const r of missingInNode) console.log(`  + ${r}`);
	}

	if (missingInSpec.length) {
		console.error(
			`\nNode routes absent from the pinned spec (${missingInSpec.length}):`,
		);
		for (const r of missingInSpec) console.error(`  - ${r}`);
		console.error(
			'\nThe node is calling endpoints not in the official spec for this version.',
		);
		console.error(
			'Either the spec moved/renamed them or the node is out of date.',
		);
		process.exit(1);
	}

	console.log('\nNo drift: every node route is present in the pinned spec.');
}

main().catch((err) => {
	console.error(err);
	process.exit(2);
});
