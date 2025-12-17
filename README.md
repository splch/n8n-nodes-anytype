# n8n-nodes-anytype

An n8n community node for the **Anytype API**.

It supports the official Anytype API resources:

- Auth (Create Challenge, Create API Key)
- Search (Global and Space search)
- Spaces
- Lists
- Members
- Objects
- Properties
- Tags
- Types
- Templates
- Plus an **API Request** resource for custom endpoints and advanced use cases.

## Installation

Follow the n8n community nodes installation guide.

## Credentials

Create **Anytype API** credentials in n8n:

- **Base URL**:
  - Default: `http://localhost:31009/v1`
  - Change if your Anytype API is exposed elsewhere.
- **API Version**:
  - Default: `2025-11-08`
  - Sent as the `Anytype-Version` header.
- **API Key**:
  - A token you pass as `Authorization: Bearer <token>`.

### How to get an API key (Auth flow)

You can do this with the node itself:

1) Use **Anytype → Auth → Create Challenge** with an `App Name`
2) Check Anytype Desktop for the 4-digit code
3) Use **Anytype → Auth → Create API Key** with:
   - `challenge_id` from step 1
   - the 4-digit code

Copy the returned `api_key` into your n8n credential.

## Notes on pagination

Most “Get Many” endpoints return:
```json
{ "data": [...], "pagination": { "offset": 0, "limit": 100, "has_more": true, "total": 123 } }
````

This node automatically returns only the `data` array as n8n items when using “Get Many”.

If you need the full raw response (including `pagination`), use **API Request**.

## Operations

### Auth

* Create Challenge
* Create API Key

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

### API Request

* GET / POST / PATCH / PUT / DELETE (custom endpoint)

## Resources

* n8n community nodes documentation
* Anytype developer docs (API reference)
