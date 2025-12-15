import React, { useEffect, useRef } from 'react';

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const modalNode = modalRef.current;
    const focusable = modalNode ? Array.from(modalNode.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled')) : [];
    if (focusable.length) focusable[0].focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      } else if (e.key === 'Tab') {
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
      try {
        if (previouslyFocused.current && previouslyFocused.current.focus) previouslyFocused.current.focus();
      } catch (e) {
        // ignore
      }
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog" role="dialog" aria-modal="true" ref={modalRef} tabIndex={-1}>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} className="small">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

