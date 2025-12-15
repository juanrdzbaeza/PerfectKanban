import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import AddColumnForm from './AddColumnForm';

function KanbanBoard({ state, dispatch }) {
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {state.lists.map((list) => (
          <Column key={list.id} list={list} dispatch={dispatch} />
        ))}
        <AddColumnForm dispatch={dispatch} />
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;

