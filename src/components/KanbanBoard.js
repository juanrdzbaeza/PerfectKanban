import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import AddColumnForm from './AddColumnForm';
import CardModal from './CardModal';
import ConfirmDialog from './ConfirmDialog';

function KanbanBoard({ state, dispatch }) {
  const [selectedCard, setSelectedCard] = useState(null); // { listId, card }
  const [confirm, setConfirm] = useState(null); // { type: 'card'|'list', listId, cardId, message }

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    dispatch({
      type: 'MOVE_CARD',
      payload: {
        fromListId: source.droppableId,
        toListId: destination.droppableId,
        fromIndex: source.index,
        toIndex: destination.index,
      },
    });
  };

  const openCard = (listId, card) => setSelectedCard({ listId, card });
  const closeCard = () => setSelectedCard(null);
  const saveCard = (listId, cardId, updates) => dispatch({ type: 'EDIT_CARD', payload: { listId, cardId, updates } });

  const requestDeleteCard = (listId, cardId) => setConfirm({ type: 'card', listId, cardId, message: '¿Eliminar esta tarjeta?' });
  const requestDeleteList = (listId) => setConfirm({ type: 'list', listId, message: '¿Eliminar esta columna y todas sus tarjetas?' });

  const cancelConfirm = () => setConfirm(null);
  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.type === 'card') {
      dispatch({ type: 'REMOVE_CARD', payload: { listId: confirm.listId, cardId: confirm.cardId } });
    } else if (confirm.type === 'list') {
      dispatch({ type: 'REMOVE_LIST', payload: { listId: confirm.listId } });
    }
    setConfirm(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {state.lists.map((list) => (
          <Column
            key={list.id}
            list={list}
            dispatch={dispatch}
            onOpenCard={openCard}
            onRequestDeleteList={requestDeleteList}
            onRequestDeleteCard={requestDeleteCard}
          />
        ))}
        <AddColumnForm dispatch={dispatch} />

        <CardModal open={!!selectedCard} card={selectedCard ? selectedCard.card : null} listId={selectedCard ? selectedCard.listId : null} onSave={saveCard} onClose={closeCard} />

        <ConfirmDialog open={!!confirm} message={confirm ? confirm.message : ''} onConfirm={confirmAction} onCancel={cancelConfirm} />
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;

