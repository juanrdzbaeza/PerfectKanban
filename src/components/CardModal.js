import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function Icon({ children }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <g fill="currentColor">
        <text x="0" y="13" fontSize="12">{children}</text>
      </g>
    </svg>
  );
}

function CardModal({ open, card, listId, onSave, onClose }) {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? card.description || '' : '');
  const [preview, setPreview] = useState(false);
  const modalRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const wrapSelection = (before, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const newValue = ta.value.substring(0, start) + before + selected + after + ta.value.substring(end);
    setDescription(newValue);

    // restore selection inside wrapped content
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  };

  const prefixLines = (prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = ta.value.substring(0, start);
    const middle = ta.value.substring(start, end);
    const after = ta.value.substring(end);
    const newMiddle = middle
      .split('\n')
      .map((ln) => (ln.trim() ? `${prefix}${ln}` : ln))
      .join('\n');
    const newValue = before + newMiddle + after;
    setDescription(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start;
      ta.selectionEnd = start + newMiddle.length;
    });
  };

  const insertLink = () => {
    const url = window.prompt('URL del enlace');
    if (!url) return;
    wrapSelection('[', `](${url})`);
  };

  const insertCodeBlock = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end) || 'codigo';
    const newValue = ta.value.substring(0, start) + '```\n' + selected + '\n```' + ta.value.substring(end);
    setDescription(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + 4;
      ta.selectionEnd = start + 4 + selected.length;
    });
  };

  const onAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAttach = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const insertText = `[attached: ${f.name}]`;
    const ta = textareaRef.current;
    if (!ta) return setDescription((d) => d + '\n' + insertText);
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = ta.value.substring(0, start) + insertText + ta.value.substring(end);
    setDescription(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + insertText.length;
      ta.selectionStart = ta.selectionEnd = pos;
    });
    // reset input
    e.target.value = '';
  };

  // Render sanitized HTML using marked + DOMPurify
  const renderPreview = (md) => {
    try {
      const raw = marked.parse(md || '');
      return DOMPurify.sanitize(raw);
    } catch (e) {
      return DOMPurify.sanitize(String(md || ''));
    }
  };

  return (
    <div className="confirm-overlay">
      <div
        className="confirm-dialog md-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        aria-describedby="card-modal-desc"
        ref={modalRef}
        tabIndex={-1}
      >
        <h3 id="card-modal-title">Detalles de la tarjeta</h3>

        {/* Descripción para tecnologías asistivas con instrucciones de teclado */}
        <p id="card-modal-desc" style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
          Usa Tab para navegar entre controles. Presiona Esc para cerrar sin guardar. Los cambios se aplican al pulsar "Guardar".
        </p>

        <div>
          <label htmlFor="card-title-input">Título</label>
          <input id="card-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="md-area-wrapper" style={{ marginTop: 12 }}>
          <div className="md-header">
            <div role="toolbar" aria-label="Editor toolbar" className="md-header-toolbar">
              <button type="button" title="Bold" aria-label="Bold" onClick={() => wrapSelection('**')} className="md-btn"><Icon>B</Icon></button>
              <button type="button" title="Italic" aria-label="Italic" onClick={() => wrapSelection('_')} className="md-btn"><Icon>I</Icon></button>
              <button type="button" title="Code" aria-label="Code" onClick={insertCodeBlock} className="md-btn"><Icon>{`</>`}</Icon></button>
              <button type="button" title="List" aria-label="List" onClick={() => prefixLines('- ')} className="md-btn">• List</button>
              <button type="button" title="Link" aria-label="Link" onClick={insertLink} className="md-btn">🔗</button>

              {/* Attach button + hidden file input */}
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleAttach} aria-hidden="true" />
              <button type="button" title="Attach file" aria-label="Attach file" onClick={onAttachClick} className="md-btn attach-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.44 11.05l-9.19 9.2a5 5 0 1 1-7.07-7.07l8.48-8.48a3 3 0 1 1 4.24 4.24L9.7 17.17a1 1 0 0 1-1.41-1.41l7.07-7.07"/></svg>
              </button>

              <button type="button" title="Preview" aria-label="Preview" onClick={() => setPreview((p) => !p)} className="md-btn preview-toggle">{preview ? 'Edit' : 'Preview'}</button>
            </div>
          </div>

          <div className="md-write-holder">
            {!preview ? (
              <textarea
                id="card-desc-textarea"
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-label="Descripción"
                placeholder="Escribe la descripción en Markdown..."
              />
            ) : (
              <div className="md-preview-holder" aria-live="polite">
                <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderPreview(description) }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={save} className="small">Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default CardModal;

