# n8n-nodes-anytype

An n8n community node for the **Anytype API**.

https://github.com/user-attachments/assets/59b52a17-696c-450f-8836-d1d068232488

It supports the official Anytype API resources:

- Search (Global and Space search)
- Spaces
- Lists
- Members
- Objects
- Properties
- Tags
- Types
- Templates

## Installation

Follow the n8n community nodes installation guide.

## Credentials

Create **Anytype API** credentials in n8n:

- **Base URL**:
  - Default: `http://127.0.0.1:31009/v1`
  - Change if your Anytype API is exposed elsewhere.
- **API Version**:
  - Default: `2025-11-08`
  - Sent as the `Anytype-Version` header.
- **API Key**:
  - A token you pass as `Authorization: Bearer <token>`.

### How to get an API key (outside this node)

Generate the API key with Anytype's official auth flow, then paste it into the n8n credential:

1) Create an auth challenge (`POST /auth/challenges`) with your app name
2) Check Anytype Desktop for the 4-digit code
3) Create the API key (`POST /auth/api_keys`) with the challenge ID and code

See Anytype docs: https://developers.anytype.io/docs/reference/2025-11-08/create-api-key/

## Notes on pagination

Most “Get Many” endpoints return:
```json
{ "data": [...], "pagination": { "offset": 0, "limit": 100, "has_more": true, "total": 123 } }
````

This node automatically returns only the `data` array as n8n items when using “Get Many”.

If you need the full raw response (including `pagination`) or unsupported endpoints, use n8n's
**HTTP Request** node with your Anytype base URL, `Anytype-Version` header, and Bearer API key.

## Operations

### Search

* Search objects across all spaces
* Search objects within a space

### Spaces

* Get Many
* Create
* Get
* Update

### Lists

* Add objects to list
* Remove object from list
* Get list views
* Get objects in list

### Members

* Get Many
* Get

### Objects

* Get Many
* Create
* Get
* Update
* Delete

### Properties

* Get Many
* Create
* Get
* Update
* Delete

### Tags

* Get Many
* Create
* Get
* Update
* Delete

### Types

* Get Many
* Create
* Get
* Update
* Delete

### Templates

* Get Many
* Get

## Resources

* n8n community nodes ([documentation](https://docs.n8n.io/integrations/community-nodes/))
* Anytype developer docs ([API reference](https://developers.anytype.io/docs/reference))
