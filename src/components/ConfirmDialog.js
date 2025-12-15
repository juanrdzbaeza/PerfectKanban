import React from 'react';

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
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

