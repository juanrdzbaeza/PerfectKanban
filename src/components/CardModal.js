import React, { useState, useEffect, useRef } from 'react';

function CardModal({ open, card, listId, onSave, onClose }) {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? card.description || '' : '');
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  // Focus trap and Escape to close
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    // focus first focusable element inside modal
    const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const modalNode = modalRef.current;
    const focusable = modalNode ? Array.from(modalNode.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled')) : [];
    if (focusable.length) {
      focusable[0].focus();
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        // trap focus
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // restore focus
      try {
        if (previouslyFocused.current && previouslyFocused.current.focus) previouslyFocused.current.focus();
      } catch (e) {
        // ignore
      }
    };
  }, [open, onClose]);

  if (!open || !card) return null;

  const save = () => {
    const updates = { title: (title || '').trim() || 'Sin título', description };
    onSave(listId, card.id, updates);
    onClose();
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="card-modal-title" ref={modalRef} tabIndex={-1}>
        <h3 id="card-modal-title">Detalles de la tarjeta</h3>
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

