// Small id generator to avoid ESM uuid issues in test environment
function uuidv4() {
  return 'id-' + Math.random().toString(36).slice(2, 9);
}

export const initialSampleData = () => ({
  lists: [
    {
      id: 'list-1',
      title: 'Por hacer',
      cards: [
        {
          id: 'card-1',
          title: 'Investigar idea Kanban',
          description: 'Leer requisitos y diseñar MVP',
          createdAt: Date.now(),
        },
      ],
    },
    {
      id: 'list-2',
      title: 'En progreso',
      cards: [],
    },
    {
      id: 'list-3',
      title: 'Hecho',
      cards: [],
    },
  ],
});

export const actionTypes = {
  ADD_LIST: 'ADD_LIST',
  RENAME_LIST: 'RENAME_LIST',
  REMOVE_LIST: 'REMOVE_LIST',
  ADD_CARD: 'ADD_CARD',
  EDIT_CARD: 'EDIT_CARD',
  REMOVE_CARD: 'REMOVE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  SET_STATE: 'SET_STATE',
};

export function boardReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_LIST: {
      const { title } = action.payload;
      const newList = { id: uuidv4(), title: title || 'Untitled', cards: [] };
      return { ...state, lists: [...state.lists, newList] };
    }

    case actionTypes.RENAME_LIST: {
      const { listId, title } = action.payload;
      return {
        ...state,
        lists: state.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
      };
    }

    case actionTypes.REMOVE_LIST: {
      const { listId } = action.payload;
      return { ...state, lists: state.lists.filter((l) => l.id !== listId) };
    }

    case actionTypes.ADD_CARD: {
      const { listId, card } = action.payload;
      const newCard = { id: uuidv4(), createdAt: Date.now(), ...card };
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
        ),
      };
    }

    case actionTypes.EDIT_CARD: {
      const { listId, cardId, updates } = action.payload;
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === listId
            ? { ...l, cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)) }
            : l
        ),
      };
    }

    case actionTypes.REMOVE_CARD: {
      const { listId, cardId } = action.payload;
      return {
        ...state,
        lists: state.lists.map((l) => (l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l)),
      };
    }

    case actionTypes.MOVE_CARD: {
      const { fromListId, toListId, fromIndex, toIndex } = action.payload;

      if (fromListId === toListId) {
        // reorder within same list
        return {
          ...state,
          lists: state.lists.map((l) => {
            if (l.id !== fromListId) return l;
            const newCards = Array.from(l.cards);
            const [moved] = newCards.splice(fromIndex, 1);
            newCards.splice(toIndex, 0, moved);
            return { ...l, cards: newCards };
          }),
        };
      }

      // move between lists
      let movedCard = null;
      const listsAfterRemoval = state.lists.map((l) => {
        if (l.id !== fromListId) return l;
        const newCards = Array.from(l.cards);
        const [m] = newCards.splice(fromIndex, 1);
        movedCard = m;
        return { ...l, cards: newCards };
      });

      const listsAfterInsert = listsAfterRemoval.map((l) => {
        if (l.id !== toListId) return l;
        const newCards = Array.from(l.cards);
        newCards.splice(toIndex, 0, movedCard);
        return { ...l, cards: newCards };
      });

      return { ...state, lists: listsAfterInsert };
    }

    case actionTypes.SET_STATE: {
      return action.payload;
    }

    default:
      return state;
  }
}
