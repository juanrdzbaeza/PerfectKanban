import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

function Card({ card, index, listId, dispatch, onOpenCard, onRequestDeleteCard }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const remove = () => {
    if (onRequestDeleteCard) return onRequestDeleteCard(listId, card.id);
    return dispatch({ type: 'REMOVE_CARD', payload: { listId, cardId: card.id } });
  };

  const startEdit = (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  const saveEdit = () => {
    const newTitle = (title || '').trim() || 'Sin título';
    if (newTitle !== card.title) {
      dispatch({ type: 'EDIT_CARD', payload: { listId, cardId: card.id, updates: { title: newTitle } } });
    }
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setTitle(card.title);
      setEditing(false);
    }
  };

  const openDetails = () => {
    if (onOpenCard) onOpenCard(listId, card);
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div className="card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={openDetails}>
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={onKeyDown}
            />
          ) : (
            <div className="card-title" onDoubleClick={startEdit}>{card.title}</div>
          )}
          <button className="small" onClick={(e) => { e.stopPropagation(); remove(); }}>Eliminar</button>
        </div>
      )}
    </Draggable>
  );
}

export default Card;

