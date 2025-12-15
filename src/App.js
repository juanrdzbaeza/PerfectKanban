import React, { useReducer } from 'react';
import './App.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import { boardReducer, initialSampleData } from './state/boardReducer';
import KanbanBoard from './components/KanbanBoard';

function App() {
  const [stored, setStored] = useLocalStorage('kanban-board', initialSampleData);
  const [state, dispatch] = useReducer(boardReducer, stored);

  // Sync reducer state back to localStorage when state changes
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
