import React, { useState, useEffect, useRef } from 'react';
import { renderMarkdown } from '../utils/markdown';

function Icon({ children }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <g fill="currentColor">
        <text x="0" y="13" fontSize="12">{children}</text>
      </g>
    </svg>
  );
}

// Mock upload function: simula subida y devuelve URL
function mockUpload(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeUrl = `https://cdn.example.com/uploads/${encodeURIComponent(file.name)}`;
      resolve({ url: fakeUrl, name: file.name });
    }, 700);
  });
}

function CardModal({ open, card, listId, onSave, onClose }) {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? card.description || '' : '');
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [format, setFormat] = useState('');
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
      ta.selectionStart = start + 4; // inside code fence
      ta.selectionEnd = start + 4 + selected.length;
    });
  };

  const onAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAttach = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    // Simular subida de archivo
    const { url } = await mockUpload(f);
    setUploading(false);
    const insertText = `[attached: ${f.name}](${url})`;
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

  // applyBlockFormat will change the block level formatting
  const applyBlockFormat = (fmt) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    // split into lines
    const lines = val.split('\n');
    const getLineIndex = (pos) => {
      if (pos <= 0) return 0;
      return Math.max(0, val.substring(0, pos).split('\n').length - 1);
    };

    const startLine = getLineIndex(start);
    const endLine = getLineIndex(Math.max(0, end - 1));

    // extract selected lines
    const beforeLines = lines.slice(0, startLine);
    const targetLines = lines.slice(startLine, endLine + 1);
    const afterLines = lines.slice(endLine + 1);

    // normalize: remove existing header/blockquote prefixes (allow leading spaces)
    const normalized = targetLines.map((ln) => ln.replace(/^\s*(#{1,6}\s+|>\s*)/, ''));

    let transformedLines;
    if (fmt === 'p') {
      transformedLines = normalized.map((ln) => ln);
    } else if (fmt === 'blockquote') {
      transformedLines = normalized.map((ln) => (ln.trim() ? `> ${ln}` : ln));
    } else if (fmt && fmt.startsWith('h')) {
      const level = parseInt(fmt.replace('h', ''), 10);
      const prefix = '#'.repeat(level) + ' ';
      transformedLines = normalized.map((ln) => (ln.trim() ? `${prefix}${ln}` : ln));
    } else {
      transformedLines = normalized.map((ln) => ln);
    }

    // reassemble
    const beforeText = beforeLines.length ? beforeLines.join('\n') + '\n' : '';
    const transformedText = transformedLines.join('\n');
    const afterText = afterLines.length ? '\n' + afterLines.join('\n') : '';
    const newValue = beforeText + transformedText + afterText;

    setDescription(newValue);

    // compute new selection bounds
    const newStart = beforeText.length;
    const newEnd = beforeText.length + transformedText.length;

    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = newStart;
      ta.selectionEnd = newEnd;
    });

    // reset controlled select
    setFormat('');
  };

  // Render sanitized HTML using marked + DOMPurify
  const renderPreview = (md) => {
    try {
      return renderMarkdown(md || '');
    } catch (e) {
      return String(md || '');
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
              <select aria-label="Formato" className="md-format-select" value={format} onChange={(e) => { const v = e.target.value; setFormat(v); if (v) { applyBlockFormat(v); } }}>
                <option value="">Formato</option>
                <option value="p">Parrafo</option>
                <option value="h1"># Título1</option>
                <option value="h2">## Título2</option>
                <option value="h3">### Título3</option>
                <option value="h4">#### Título4</option>
                <option value="blockquote">> Entrada</option>
              </select>
              <button type="button" title="Bold" aria-label="Bold" onClick={() => wrapSelection('**')} className="md-btn"><Icon>B</Icon></button>
              <button type="button" title="Italic" aria-label="Italic" onClick={() => wrapSelection('_')} className="md-btn"><Icon>I</Icon></button>
              <button type="button" title="Code" aria-label="Code" onClick={insertCodeBlock} className="md-btn"><Icon>{`</>`}</Icon></button>
              <button type="button" title="List" aria-label="List" onClick={() => prefixLines('- ')} className="md-btn">• List</button>
              <button type="button" title="Link" aria-label="Link" onClick={insertLink} className="md-btn">🔗</button>

              {/* Attach button + hidden file input */}
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleAttach} aria-hidden="true" />
              <button type="button" title="Attach file" aria-label="Attach file" onClick={onAttachClick} className="md-btn attach-btn">
                {uploading ? 'Subiendo...' : '📎 Adjuntar archivo'}
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

