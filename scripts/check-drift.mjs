#!/usr/bin/env node
// Offline drift check: every route in the resource files must be declared in
// nodes/Anytype/generated/spec.ts (IMPLEMENTED_ROUTES), and vice versa.
// When bumping the API version, update spec.ts from the official OpenAPI spec
// (URL is in that file) and run this script.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMPLEMENTED_ROUTES } from '../dist/nodes/Anytype/generated/spec.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESOURCES_DIR = join(ROOT, 'nodes/Anytype/resources');

function canonical(path) {
	return path
		.replace(/^=/, '')
		.replace(/\{\{\$parameter\.([^}]+)\}\}/g, '{$1}')
		.replace(/\{([^}]+)\}/g, (_, name) => {
			// parameter names are camelCase; spec paths use snake_case
			return '{' + name.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()) + '}';
		});
}

async function* walkTs(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) yield* walkTs(p);
		else if (entry.isFile() && p.endsWith('.ts')) yield p;
	}
}

const nodeRoutes = new Set();
const re = /method:\s*'(GET|POST|PATCH|PUT|DELETE)'[\s\S]{0,400}?url:\s*'([^']+)'/g;
for await (const file of walkTs(RESOURCES_DIR)) {
	const text = await readFile(file, 'utf8');
	for (const m of text.matchAll(re)) nodeRoutes.add(`${m[1]} ${canonical(m[2])}`);
}

const specRoutes = new Set(IMPLEMENTED_ROUTES);
const missingInSpec = [...nodeRoutes].filter((r) => !specRoutes.has(r)).sort();
const missingInNode = [...specRoutes].filter((r) => !nodeRoutes.has(r)).sort();

console.log(`Node routes: ${nodeRoutes.size}  Declared spec routes: ${specRoutes.size}`);

let failed = false;
if (missingInSpec.length) {
	failed = true;
	console.error('\nRoutes called by the node but not declared in generated/spec.ts:');
	for (const r of missingInSpec) console.error(`  - ${r}`);
}
if (missingInNode.length) {
	failed = true;
	console.error('\nDeclared in generated/spec.ts but not implemented by the node:');
	for (const r of missingInNode) console.error(`  + ${r}`);
}

console.log(failed ? '\nDrift detected.' : '\nNo drift: node routes and declared spec routes match.');
process.exit(failed ? 1 : 0);
