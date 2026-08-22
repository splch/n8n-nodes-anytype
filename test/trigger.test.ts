import { SEEN_IDS_CAP, nextSeenState } from '../nodes/AnytypeTrigger/AnytypeTrigger.node';
import type { IDataObject } from 'n8n-workflow';

const obj = (id: string): IDataObject => ({ id });

describe('trigger dedup state', () => {
	it('first poll establishes the baseline without emitting', () => {
		const { newObjects, state } = nextSeenState(undefined, [obj('a'), obj('b')]);
		expect(newObjects).toEqual([]);
		expect(state.seenIds.sort()).toEqual(['a', 'b']);
	});

	it('emits only previously unseen objects', () => {
		const prev = { seenIds: ['a', 'b'] };
		const { newObjects, state } = nextSeenState(prev, [obj('a'), obj('c')]);
		expect(newObjects).toEqual([obj('c')]);
		expect(state.seenIds.sort()).toEqual(['a', 'b', 'c']);
	});

	it('re-emits nothing when nothing is new', () => {
		const { newObjects } = nextSeenState({ seenIds: ['a'] }, [obj('a')]);
		expect(newObjects).toEqual([]);
	});

	it('edited objects (same id) never re-emit', () => {
		const prev = { seenIds: ['a'] };
		const edited = { id: 'a', name: 'changed' };
		expect(nextSeenState(prev, [edited]).newObjects).toEqual([]);
	});

	it('caps seen ids at SEEN_IDS_CAP, keeping newest', () => {
		const many = Array.from({ length: SEEN_IDS_CAP + 5 }, (_, i) => obj(`o${i}`));
		const { state } = nextSeenState(undefined, many);
		expect(state.seenIds.length).toBe(SEEN_IDS_CAP);
		expect(state.seenIds).toContain(`o${SEEN_IDS_CAP + 4}`);
		expect(state.seenIds).not.toContain('o0');
	});
});
