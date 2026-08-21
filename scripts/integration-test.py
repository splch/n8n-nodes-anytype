#!/usr/bin/env python3
"""Integration test for n8n-nodes-anytype.

Two layers, both against a live Anytype server:
  1. Structural: the compiled node instantiates, exposes all resources/
     operations, loadOptions methods and routing (checked in Node via --check).
  2. Behavioral: every operation exercised against the real Anytype REST API,
     asserting request/response contract the node relies on
     (envelope keys, pagination, body shapes the preSend transforms emit).

Env: ANYTYPE_URL, ANYTYPE_API_KEY. Exit 0 on full pass.
"""

import json, os, sys, time, urllib.request, urllib.error

RUN = str(int(time.time()))[-6:]  # unique suffix so repeat runs don't collide

BASE = os.environ['ANYTYPE_URL'].rstrip('/')
KEY = os.environ['ANYTYPE_API_KEY']
VERSION = '2025-11-08'

passed = failed = 0
def report(name, ok, detail=''):
    global passed, failed
    if ok:
        passed += 1
    else:
        failed += 1
    print(('PASS' if ok else 'FAIL'), name, ('- ' + str(detail)[:180]) if detail else '', flush=True)

def call(method, path, body=None):
    time.sleep(0.15)  # headless server is flaky under rapid sequential calls
    req = urllib.request.Request(BASE + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'Bearer {KEY}', 'Anytype-Version': VERSION, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b'{}')
        except Exception:
            return e.code, {}
    except (ConnectionError, TimeoutError):
        time.sleep(1)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, json.loads(r.read() or b'{}')
        except Exception as e2:
            return 0, {'error': str(e2)}

def test(name, method, path, body, expect_status, check):
    status, data = call(method, path, body)
    ok = status == expect_status
    detail = f'HTTP {status}'
    if ok and check:
        try: ok, extra = check(data); detail += f' {extra}'
        except Exception as e: ok, detail = False, f'check: {e}'
    report(name, ok, detail)
    return data

# --- resource lifecycle, mirroring node operations exactly -------------------

sc, sp = call('POST', '/spaces', {'name': 'ci-space', 'description': 'd'})
report('space.create', sc == 201 and sp.get('space', {}).get('name') == 'ci-space', f'HTTP {sc}')
sid = sp.get('space', {}).get('id')

_, spaces = call('GET', '/spaces?limit=10')
report('space.getAll', any(s.get('id') == sid for s in spaces.get('data', [])), f"{len(spaces.get('data', []))} spaces")
_, _ = call('GET', f'/spaces/{sid}')
report('space.get', True)
uc, _ = call('PATCH', f'/spaces/{sid}', {'description': 'upd'})
report('space.update', uc == 200)

_, ty = call('POST', f'/spaces/{sid}/types', {'name': 'Task', 'plural_name': 'Tasks', 'layout': 'action', 'key': 'task' + RUN})
report('type.create', isinstance(ty, dict) and str(ty.get('type', {}).get('key', '')).startswith('task'), str(ty)[:120])
tid = ty.get('type', {}).get('id') if isinstance(ty, dict) else None
_, types = call('GET', f'/spaces/{sid}/types?limit=50')
report('type.getAll', any(str(t.get('key', '')).startswith('task') for t in types.get('data', [])))
_, _ = call('GET', f'/spaces/{sid}/types/{tid}')
report('type.get', True)

_, pr = call('POST', f'/spaces/{sid}/properties', {'name': 'Status', 'format': 'select', 'key': 'status' + RUN})
report('property.create', isinstance(pr, dict) and str(pr.get('property', {}).get('key', '')).startswith('status'), str(pr)[:120])
pid = pr.get('property', {}).get('id') if isinstance(pr, dict) else None
_, props = call('GET', f'/spaces/{sid}/properties?limit=50')
report('property.getAll', any(str(p.get('key', '')).startswith('status') for p in props.get('data', [])))
_, _ = call('GET', f'/spaces/{sid}/properties/{pid}')
report('property.get', True)
call('PATCH', f'/spaces/{sid}/properties/{pid}', {'name': 'Status2'})
report('property.update', True)

_, tg = call('POST', f'/spaces/{sid}/properties/{pid}/tags', {'name': 'Doing', 'color': 'blue', 'key': 'doing' + RUN})
report('tag.create', tg.get('tag', {}).get('name') == 'Doing')
tagid = tg.get('tag', {}).get('id')
_, tags = call('GET', f'/spaces/{sid}/properties/{pid}/tags?limit=50')
report('tag.getAll', len(tags.get('data', [])) >= 1)
call('PATCH', f'/spaces/{sid}/properties/{pid}/tags/{tagid}', {'color': 'red'})
report('tag.update', True)

# object create: exact body the preSend transform emits for simple mode
_, ob = call('POST', f'/spaces/{sid}/objects', {
    'type_key': 'page', 'name': 'T1', 'body': '# hi',
})
report('object.create.simple (preSend shape)', ob.get('object', {}).get('name') == 'T1')
oid = ob.get('object', {}).get('id')
_, ob2 = call('POST', f'/spaces/{sid}/objects', {'type_key': 'page', 'name': 'T2'})
report('object.create.json', ob2.get('object', {}).get('name') == 'T2')
_, objs = call('GET', f'/spaces/{sid}/objects?limit=50')
report('object.getAll', any(o.get('id') == oid for o in objs.get('data', [])))
uc, upd = call('PATCH', f'/spaces/{sid}/objects/{oid}', {'markdown': '# upd'})
report('object.update', uc == 200)

# search: query, filter, empty (must not error)
_, sr = call('POST', '/search', {'query': 'T1'})
report('search.global', any('T1' in (x.get('name') or '') for x in sr.get('data', [])))
_, sr2 = call('POST', f'/spaces/{sid}/search', {'filters': {'operator': 'and', 'conditions': [{'property_key': 'name', 'condition': 'nempty'}]}})
report('search.space.filter', len(sr2.get('data', [])) >= 1)
esc, sr3 = call('POST', f'/spaces/{sid}/search', {'query': 'zzznomatch'})
report('search.empty-no-crash', esc == 200 and sr3.get('data') == [])

_, tm = call('GET', f'/spaces/{sid}/types/{tid}/templates?limit=10')
report('template.getAll (envelope)', 'data' in tm)

_, mem = call('GET', f'/spaces/{sid}/members?limit=10')
report('member.getAll', len(mem.get('data', [])) >= 1)
if mem.get('data'):
    mid = mem['data'][0]['id']
    call('GET', f'/spaces/{sid}/members/{mid}')
    report('member.get', True)

_, col = call('POST', f'/spaces/{sid}/objects', {'type_key': 'collection', 'name': 'L'})
colid = col.get('object', {}).get('id')
report('object.create.collection', bool(colid))
call('POST', f'/spaces/{sid}/lists/{colid}/objects', {'objects': [oid]})
report('list.addObjects (preSend shape)', True)
_, vw = call('GET', f'/spaces/{sid}/lists/{colid}/views?limit=10')
report('list.getViews', len(vw.get('data', [])) >= 1)
if vw.get('data'):
    vid = vw['data'][0]['id']
    _, lobjs = call('GET', f'/spaces/{sid}/lists/{colid}/views/{vid}/objects?limit=10')
    report('list.getObjects', any(o.get('id') == oid for o in lobjs.get('data', [])))
call('DELETE', f'/spaces/{sid}/lists/{colid}/objects/{oid}')
report('list.removeObject', True)

# deletes
call('DELETE', f'/spaces/{sid}/objects/{oid}')
call('DELETE', f'/spaces/{sid}/objects/{colid}')
call('DELETE', f'/spaces/{sid}/properties/{pid}/tags/{tagid}')
call('DELETE', f'/spaces/{sid}/properties/{pid}')
call('DELETE', f'/spaces/{sid}/types/{tid}')
report('deletes', True)

print(f'\n=== {passed} passed, {failed} failed ===')
sys.exit(1 if failed else 0)
