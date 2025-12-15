import React from 'react';

function AddColumnForm({ dispatch }) {
  const add = () => dispatch({ type: 'ADD_LIST', payload: { title: 'Nueva lista' } });
  return (
    <div className="add-column">
      <button onClick={add}>+ Añadir lista</button>
    </div>
  );
}

export default AddColumnForm;

