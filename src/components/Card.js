import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

function Card({ card, index, listId, dispatch }) {
  const remove = () => dispatch({ type: 'REMOVE_CARD', payload: { listId, cardId: card.id } });

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div className="card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <div className="card-title">{card.title}</div>
          <button className="small" onClick={remove}>Eliminar</button>
        </div>
      )}
    </Draggable>
  );
}

export default Card;

