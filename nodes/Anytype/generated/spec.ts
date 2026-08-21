 
// Data extracted from the Anytype OpenAPI spec, version 2025-11-08.
// Update with: curl -sL https://raw.githubusercontent.com/anyproto/anytype-api/main/docs/reference/openapi-2025-11-08.yaml

export const API_VERSION = '2025-11-08';

export const PropertyFormats = [
	{ name: 'Text', value: 'text' },
	{ name: 'Number', value: 'number' },
	{ name: 'Select', value: 'select' },
	{ name: 'Multi Select', value: 'multi_select' },
	{ name: 'Date', value: 'date' },
	{ name: 'Files', value: 'files' },
	{ name: 'Checkbox', value: 'checkbox' },
	{ name: 'URL', value: 'url' },
	{ name: 'Email', value: 'email' },
	{ name: 'Phone', value: 'phone' },
	{ name: 'Objects', value: 'objects' },
] as const;

export const Colors = [
	{ name: 'Grey', value: 'grey' },
	{ name: 'Yellow', value: 'yellow' },
	{ name: 'Orange', value: 'orange' },
	{ name: 'Red', value: 'red' },
	{ name: 'Pink', value: 'pink' },
	{ name: 'Purple', value: 'purple' },
	{ name: 'Blue', value: 'blue' },
	{ name: 'Ice', value: 'ice' },
	{ name: 'Teal', value: 'teal' },
	{ name: 'Lime', value: 'lime' },
] as const;

export const FilterConditions = [
	{ name: 'Equal', value: 'eq' },
	{ name: 'Not Equal', value: 'ne' },
	{ name: 'Greater Than', value: 'gt' },
	{ name: 'Greater or Equal', value: 'gte' },
	{ name: 'Less Than', value: 'lt' },
	{ name: 'Less or Equal', value: 'lte' },
	{ name: 'Contains', value: 'contains' },
	{ name: 'Does Not Contain', value: 'ncontains' },
	{ name: 'In', value: 'in' },
	{ name: 'Not In', value: 'nin' },
	{ name: 'Contains All', value: 'all' },
	{ name: 'Is Empty', value: 'empty' },
	{ name: 'Is Not Empty', value: 'nempty' },
] as const;

export const SortProperties = [
	{ name: 'Created Date', value: 'created_date' },
	{ name: 'Last Modified Date', value: 'last_modified_date' },
	{ name: 'Last Opened Date', value: 'last_opened_date' },
	{ name: 'Name', value: 'name' },
] as const;

export const TypeLayouts = [
	{ name: 'Basic', value: 'basic' },
	{ name: 'Profile', value: 'profile' },
	{ name: 'Action', value: 'action' },
	{ name: 'Note', value: 'note' },
] as const;

// Routes implemented by this node (all present in the pinned spec).
// scripts/check-drift.mjs compares this list against the resource files.
export const IMPLEMENTED_ROUTES = [
	'POST /search',
	'GET /spaces',
	'POST /spaces',
	'GET /spaces/{space_id}',
	'PATCH /spaces/{space_id}',
	'GET /spaces/{space_id}/members',
	'GET /spaces/{space_id}/members/{member_id}',
	'GET /spaces/{space_id}/objects',
	'POST /spaces/{space_id}/objects',
	'GET /spaces/{space_id}/objects/{object_id}',
	'PATCH /spaces/{space_id}/objects/{object_id}',
	'DELETE /spaces/{space_id}/objects/{object_id}',
	'POST /spaces/{space_id}/search',
	'POST /spaces/{space_id}/lists/{list_id}/objects',
	'DELETE /spaces/{space_id}/lists/{list_id}/objects/{object_id}',
	'GET /spaces/{space_id}/lists/{list_id}/views',
	'GET /spaces/{space_id}/lists/{list_id}/views/{view_id}/objects',
	'GET /spaces/{space_id}/properties',
	'POST /spaces/{space_id}/properties',
	'GET /spaces/{space_id}/properties/{property_id}',
	'PATCH /spaces/{space_id}/properties/{property_id}',
	'DELETE /spaces/{space_id}/properties/{property_id}',
	'GET /spaces/{space_id}/properties/{property_id}/tags',
	'POST /spaces/{space_id}/properties/{property_id}/tags',
	'GET /spaces/{space_id}/properties/{property_id}/tags/{tag_id}',
	'PATCH /spaces/{space_id}/properties/{property_id}/tags/{tag_id}',
	'DELETE /spaces/{space_id}/properties/{property_id}/tags/{tag_id}',
	'GET /spaces/{space_id}/types',
	'POST /spaces/{space_id}/types',
	'GET /spaces/{space_id}/types/{type_id}',
	'PATCH /spaces/{space_id}/types/{type_id}',
	'DELETE /spaces/{space_id}/types/{type_id}',
	'GET /spaces/{space_id}/types/{type_id}/templates',
	'GET /spaces/{space_id}/types/{type_id}/templates/{template_id}',
	'GET /spaces/{space_id}/chats',
	'POST /spaces/{space_id}/chats',
	'GET /spaces/{space_id}/chats/{chat_id}/messages',
	'POST /spaces/{space_id}/chats/{chat_id}/messages',
	'GET /spaces/{space_id}/chats/{chat_id}/messages/{message_id}',
	'PATCH /spaces/{space_id}/chats/{chat_id}/messages/{message_id}',
	'DELETE /spaces/{space_id}/chats/{chat_id}/messages/{message_id}',
	'POST /spaces/{space_id}/chats/{chat_id}/messages/{message_id}/reactions',
	'POST /spaces/{space_id}/chats/{chat_id}/messages/read',
	'GET /spaces/{space_id}/chats/{chat_id}/messages/search',
	'POST /spaces/{space_id}/chats/{chat_id}/reactions/read',
	'POST /spaces/{space_id}/chats/{chat_id}/read_all',
] as const;

// Spec routes intentionally not implemented:
//   POST /spaces/{space_id}/files            (binary upload - use the HTTP Request node)
//   GET|DELETE /spaces/{space_id}/files/{id}
//   GET  /spaces/{space_id}/chats/{chat_id}/messages/stream (SSE)
//   POST /auth/challenges, POST /auth/api_keys (only needed to obtain the API key)
