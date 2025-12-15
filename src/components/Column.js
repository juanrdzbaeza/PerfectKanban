import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';

function Column({ list, dispatch }) {
  const addCard = () => {
    dispatch({ type: 'ADD_CARD', payload: { listId: list.id, card: { title: 'Nueva tarjeta' } } });
  };

  return (
    <div className="column">
      <h3>{list.title}</h3>
      <button className="small" onClick={addCard}>Añadir tarjeta</button>

      <Droppable droppableId={list.id}>
        {(provided) => (
          <div className="card-list" ref={provided.innerRef} {...provided.droppableProps}>
            {list.cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} listId={list.id} dispatch={dispatch} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;

