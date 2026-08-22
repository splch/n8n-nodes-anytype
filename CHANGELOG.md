# Changelog

All notable changes to this project are documented here.

## 1.1.0

- feat: Anytype Trigger node — poll for objects added to a list or created of a type; first-run baseline avoids flooding; dedup state in workflow memory
- feat: Simplify toggle (default on) for object/search/list-view outputs — flattened `{ key: value }` properties, inverse of the input codec
- fix: dropdown fetchers paginate beyond the first 100 entries (500-option cap)
- fix: Body field is Markdown (dropped the htmlEditor which emitted HTML)
- test: offline unit tests (jest) for the property codec, simplify, and trigger dedup logic; wired into CI

## 1.0.0

Major rewrite (breaking).

- feat: dropdown pickers (loadOptions) for spaces, types, templates, properties, tags, objects, lists, views, members and chats
- feat: Simple/JSON body mode with typed forms for search (filters, sort) and object create/update (typed property values)
- feat: Chat resource (send/edit/delete messages, reactions, read state, search)
- refactor: single CRUD builder; spec enums and routes in `nodes/Anytype/generated/spec.ts`; offline drift check
- chore: remove unused scaffold resources, generator script and network dependency

Earlier history: see git tags up to 0.2.2.
