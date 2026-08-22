# n8n-nodes-anytype

An n8n community node for the **Anytype API**.

- **Pick from dropdowns, not IDs.** Spaces, types, templates, properties, tags, objects, lists, views, members and chats are selectable from live dropdowns (expressions still work).
- **Simple or JSON bodies.** Creating objects, searching and setting property values use typed fields; every operation also has a raw JSON mode.
- **Trigger node.** Poll for new objects of a type or objects added to a list, with first-run baselining so activation doesn't flood old items.
- **Simplified output.** Object-returning operations flatten property unions into `{ key: value }` by default (toggle "Simplify" off for raw responses).
- **Spec-grounded.** Option enums and the route table live in `nodes/Anytype/generated/spec.ts`, extracted from the official OpenAPI spec (version `2025-11-08`); `npm run check-drift` keeps the node in sync.

Resources: Search, Spaces, Objects, Lists, Members, Properties, Tags, Types, Templates, Chats.

## Installation

Follow the n8n [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/).

## Credentials

Create **Anytype API** credentials:

- **Base URL** — default `http://127.0.0.1:31009/v1` (Anytype Desktop local API)
- **API Version** — default `2025-11-08`, sent as the `Anytype-Version` header
- **API Key** — sent as `Authorization: Bearer <token>`; get one via Anytype's [auth flow](https://developers.anytype.io/docs/reference/2025-11-08/create-api-key/)

## Common recipes

- **Save anything as a page** — Object → Create: pick a Space, choose the Type (e.g. `page`), set Name and Body (Markdown). Web clipping, daily notes, journaling.
- **Set properties** — Object → Create/Update → Properties: rows of property key → format → value. Select/multi-select take tag keys or IDs; checkbox is a toggle; dates accept `YYYY-MM-DD`.
- **Find objects** — Search: query text, type filter, sort and AND-combined filters as fields. JSON mode for nested OR logic.
- **Templates** — Object → Create → Template dropdown lists templates across the space's types.
- **Collections** — List → Add Objects / Get Views / Get Objects with dropdown IDs.
- **Chats** — Send Message, Toggle Reaction, Mark Read, Search Messages for agent/notification flows.
- **Trigger** — *Object Created of Type* or *Object Added to List* polling; dropdown pickers, dedup state in workflow memory.

## Pagination

List operations expose **Return All** and **Limit**; responses are unwrapped from `{ data: [...] }` into n8n items. Dropdown fetchers paginate through the API (up to 500 options). For raw responses or uncovered endpoints (file upload/download, auth), use the HTTP Request node with the same credentials.

## Development

```bash
npm run build        # compile to dist/
npm run lint         # n8n node linting rules
npm test             # offline unit tests (codec, dedup logic)
npm run check-drift  # verify node routes match generated/spec.ts
npm run update-spec  # bump to the latest Anytype OpenAPI spec, if any
```

A scheduled workflow runs `update-spec` weekly and opens a PR when a newer spec appears. If the spec removed routes the node implements, the PR's drift check fails — that's the signal to update the affected resources. To bump manually: run `npm run update-spec`, then `check-drift`.
