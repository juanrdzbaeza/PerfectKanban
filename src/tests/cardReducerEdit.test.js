import { boardReducer, initialSampleData, actionTypes } from '../state/boardReducer';

describe('boardReducer EDIT_CARD', () => {
  test('EDIT_CARD actualiza title y description de la tarjeta correcta', () => {
    const state = initialSampleData();
    const listId = state.lists[0].id;
    const cardId = state.lists[0].cards[0].id;

    const updates = { title: 'Nuevo título', description: 'Nueva descripción' };
    const action = { type: actionTypes.EDIT_CARD, payload: { listId, cardId, updates } };

    const newState = boardReducer(state, action);

    const updatedList = newState.lists.find((l) => l.id === listId);
    const updatedCard = updatedList.cards.find((c) => c.id === cardId);

    expect(updatedCard.title).toBe('Nuevo título');
    expect(updatedCard.description).toBe('Nueva descripción');

    // Asegurar que otras listas no se modificaron
    expect(newState.lists.length).toBe(state.lists.length);
  });
});

