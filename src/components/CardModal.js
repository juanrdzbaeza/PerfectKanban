import React, { useState, useEffect } from 'react';

function CardModal({ open, card, listId, onSave, onClose }) {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? card.description || '' : '');

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  if (!open || !card) return null;

  const save = () => {
    const updates = { title: (title || '').trim() || 'Sin título', description };
    onSave(listId, card.id, updates);
    onClose();
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3>Detalles de la tarjeta</h3>
        <div>
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={save} className="small">Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default CardModal;

