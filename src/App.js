import React, { useReducer, useEffect } from 'react';
import './App.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import { boardReducer, initialSampleData, actionTypes } from './state/boardReducer';
import KanbanBoard from './components/KanbanBoard';

function App() {
  const [stored, setStored] = useLocalStorage('kanban-board', initialSampleData);
  const [state, dispatch] = useReducer(boardReducer, stored);

  // Cuando el hook hidrata desde el servidor (SQLite), actualizamos el reducer
  useEffect(() => {
    try {
      if (!stored) return;
      // Evitar dispatch innecesario: solo si difiere del state actual
      const same = JSON.stringify(stored) === JSON.stringify(state);
      if (!same) {
        dispatch({ type: actionTypes.SET_STATE, payload: stored });
      }
    } catch (e) {
      // Si JSON.stringify falla por circular refs (no debería), forzamos el set
      dispatch({ type: actionTypes.SET_STATE, payload: stored });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  // Sync reducer state back to persistence (now server/SQLite) when state changes
  React.useEffect(() => {
    setStored(state);
  }, [state, setStored]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Perfect Kanban — MVP</h1>
      </header>
      <main>
        <KanbanBoard state={state} dispatch={dispatch} />
      </main>
    </div>
  );
}

export default App;
