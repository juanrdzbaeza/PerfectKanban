// Edit: permitir inline edit del título y delegar eliminación al padre mediante onRequestDeleteList
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';

function Column({ list, dispatch, onOpenCard, onRequestDeleteList, onRequestDeleteCard }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const addCard = () => {
    dispatch({ type: 'ADD_CARD', payload: { listId: list.id, card: { title: 'Nueva tarjeta' } } });
  };

  const startEdit = () => setEditing(true);
  const saveEdit = () => {
    const newTitle = (title || '').trim() || 'Sin título';
    if (newTitle !== list.title) dispatch({ type: 'RENAME_LIST', payload: { listId: list.id, title: newTitle } });
    setEditing(false);
  };

  return (
    <div className="column">
      {editing ? (
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setTitle(list.title); setEditing(false); } }} />
      ) : (
        <h3 onDoubleClick={startEdit}>{list.title}</h3>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className="small" onClick={addCard}>Añadir tarjeta</button>
        <button className="small" onClick={() => onRequestDeleteList && onRequestDeleteList(list.id)}>Eliminar columna</button>
      </div>

      <Droppable droppableId={list.id}>
        {(provided) => (
          <div className="card-list" ref={provided.innerRef} {...provided.droppableProps}>
            {list.cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} listId={list.id} dispatch={dispatch} onOpenCard={onOpenCard} onRequestDeleteCard={onRequestDeleteCard} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;
