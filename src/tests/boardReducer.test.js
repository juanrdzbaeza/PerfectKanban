import { boardReducer, initialSampleData, actionTypes } from '../state/boardReducer';

describe('boardReducer', () => {
  test('ADD_LIST adds a new list', () => {
    const state = initialSampleData();
    const next = boardReducer(state, { type: actionTypes.ADD_LIST, payload: { title: 'Nueva' } });
    expect(next.lists.length).toBe(state.lists.length + 1);
    expect(next.lists.some((l) => l.title === 'Nueva')).toBe(true);
  });

  test('ADD_CARD adds a card to a list', () => {
    const state = initialSampleData();
    const listId = state.lists[0].id;
    const next = boardReducer(state, { type: actionTypes.ADD_CARD, payload: { listId, card: { title: 'Tarea X' } } });
    const target = next.lists.find((l) => l.id === listId);
    expect(target.cards.length).toBe(state.lists[0].cards.length + 1);
    expect(target.cards.some((c) => c.title === 'Tarea X')).toBe(true);
  });

  test('MOVE_CARD moves a card within a list', () => {
    const state = {
      lists: [
        { id: 'l1', title: 'A', cards: [{ id: 'c1', title: 'one' }, { id: 'c2', title: 'two' }, { id: 'c3', title: 'three' }] },
      ],
    };

    const next = boardReducer(state, { type: actionTypes.MOVE_CARD, payload: { fromListId: 'l1', toListId: 'l1', fromIndex: 0, toIndex: 2 } });
    expect(next.lists[0].cards.map((c) => c.id)).toEqual(['c2', 'c3', 'c1']);
  });

  test('MOVE_CARD moves a card between lists', () => {
    const state = {
      lists: [
        { id: 'l1', title: 'A', cards: [{ id: 'c1', title: 'one' }] },
        { id: 'l2', title: 'B', cards: [] },
      ],
    };

    const next = boardReducer(state, { type: actionTypes.MOVE_CARD, payload: { fromListId: 'l1', toListId: 'l2', fromIndex: 0, toIndex: 0 } });
    expect(next.lists.find((l) => l.id === 'l1').cards.length).toBe(0);
    expect(next.lists.find((l) => l.id === 'l2').cards.length).toBe(1);
    expect(next.lists.find((l) => l.id === 'l2').cards[0].id).toBe('c1');
  });
});

