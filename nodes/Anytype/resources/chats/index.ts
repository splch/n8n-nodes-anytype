import type { INodeProperties } from 'n8n-workflow';
import { bodyFrom, buildResource } from '../../shared/buildResource';
import { textField } from '../../shared/fields';

const MESSAGE_OPS = ['getMessages', 'sendMessage', 'getMessage', 'editMessage', 'deleteMessage', 'toggleReaction', 'markRead', 'readAll', 'readReactions', 'searchMessages'];
const MESSAGE_ID_OPS = ['getMessage', 'editMessage', 'deleteMessage', 'toggleReaction'];

const textBody = {
	fields: (show: Record<string, string[]>): INodeProperties[] => [
		textField('text', 'Text', show, { required: true, typeOptions: { rows: 4 } }),
	],
	preSend: bodyFrom({ text: 'text' }),
};

export const chatsDescription: INodeProperties[] = buildResource({
	resource: 'chat',
	defaultOperation: 'getMessages',
	operations: [
		{
			value: 'create',
			name: 'Create Chat',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats',
			unwrap: 'chat',
			body: {
				fields: (show) => [textField('name', 'Name', show)],
				preSend: bodyFrom({ name: 'name' }),
			},
			bodyDescription: 'CreateChatRequest JSON.',
		},
		{
			value: 'getAll',
			name: 'Get Many',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/chats',
			unwrap: 'data',
			paginated: true,
		},
		{
			value: 'getMessages',
			name: 'Get Messages',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages',
			unwrap: 'messages',
		},
		{
			value: 'sendMessage',
			name: 'Send Message',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages',
			unwrap: 'message',
			body: textBody,
			bodyDescription:
				'AddChatMessageRequest JSON. Requires text; supports style, marks, attachments, reply_to_message_id.',
		},
		{
			value: 'getMessage',
			name: 'Get Message',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/{{$parameter.messageId}}',
			unwrap: 'message',
		},
		{
			value: 'editMessage',
			name: 'Edit Message',
			method: 'PATCH',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/{{$parameter.messageId}}',
			unwrap: 'message',
			body: textBody,
			bodyDescription: 'EditChatMessageRequest JSON.',
		},
		{
			value: 'deleteMessage',
			name: 'Delete Message',
			method: 'DELETE',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/{{$parameter.messageId}}',
			unwrap: 'message',
		},
		{
			value: 'toggleReaction',
			name: 'Toggle Reaction',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/{{$parameter.messageId}}/reactions',
			body: {
				fields: (show) => [
					{
						...textField('emoji', 'Emoji', show, { required: true }),
						default: '\u{1F44D}',
					},
				],
				preSend: bodyFrom({ emoji: 'emoji' }),
			},
			bodyDescription: 'ToggleReactionRequest JSON, e.g. {"emoji":"👍"}.',
		},
		{
			value: 'markRead',
			name: 'Mark Messages Read',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/read',
			body: 'json',
			bodyDescription: 'ReadChatMessagesRequest JSON, e.g. {"type":"messages","before_order_id":"..."}.',
		},
		{
			value: 'readAll',
			name: 'Mark All Read',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/read_all',
		},
		{
			value: 'readReactions',
			name: 'Mark Reactions Read',
			method: 'POST',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/reactions/read',
			body: 'json',
			bodyDescription: 'ReadChatReactionsRequest JSON.',
		},
		{
			value: 'searchMessages',
			name: 'Search Messages',
			method: 'GET',
			url: '=/spaces/{{$parameter.spaceId}}/chats/{{$parameter.chatId}}/messages/search',
			unwrap: 'data',
			paginated: true,
		},
	],
	idParams: [
		{ name: 'spaceId', label: 'Space', ops: ['create', ...MESSAGE_OPS], loader: 'getSpaces' },
		{ name: 'chatId', label: 'Chat', ops: MESSAGE_OPS, loader: 'getChats', dependsOn: ['spaceId'] },
		{
			name: 'messageId',
			label: 'Message ID',
			ops: MESSAGE_ID_OPS,
			description: 'Message ID, e.g. from Get Messages',
		},
	],
	fields: [
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			required: true,
			default: '',
			displayOptions: { show: { resource: ['chat'], operation: ['searchMessages'] } },
			description: 'Text to search within chat messages',
			routing: { send: { type: 'query', property: 'query' } },
		},
	],
});
