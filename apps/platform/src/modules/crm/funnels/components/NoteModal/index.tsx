import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from '@hlb/design-system';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline,
  Undo2,
} from 'lucide-react';
import type { CrmOpportunityNote } from '@hlb/contracts';
import { useCrmMutations } from '../../hooks';
import { NOTE_COLORS } from '../../utils';
import styles from './NoteModal.module.css';

type NoteModalProps = {
  dealId: string;
  note?: CrmOpportunityNote;
  closeModal: () => void;
};

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export const NoteModal = ({ dealId, note, closeModal }: NoteModalProps) => {
  const editing = Boolean(note);
  const {
    addOpportunityNote,
    editOpportunityNote,
    isAddingOpportunityNote,
    isEditingOpportunityNote,
  } = useCrmMutations();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(note?.title ?? '');
  const [color, setColor] = useState(note?.color ?? NOTE_COLORS[0]);
  const [fontSize, setFontSize] = useState('3');
  const [error, setError] = useState('');

  useEffect(() => {
    if (note && editorRef.current) editorRef.current.innerHTML = note.content;
  }, [note]);

  const run = (command: string, value?: string) => {
    editorRef.current?.focus();
    exec(command, value);
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    run('fontSize', size);
  };

  const highlight = () => run('hiliteColor', '#fef08a');

  const addLink = () => {
    const url = window.prompt('URL del enlace');
    if (url) run('createLink', url);
  };

  const save = async () => {
    const content = editorRef.current?.innerHTML.trim() ?? '';
    if (!editorRef.current?.innerText.trim())
      return setError('Escribe el contenido de la nota.');
    try {
      const payload = {
        content,
        color: color === NOTE_COLORS[0] ? undefined : color,
        title: title.trim() || undefined,
      };
      if (editing && note) {
        await editOpportunityNote({ dealId, noteId: String(note.id), ...payload });
      } else {
        await addOpportunityNote({ dealId, ...payload });
      }
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel={editing ? 'Editar nota' : 'Nueva nota'}
      className={styles.modal}
      size={{ width: '68rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header className={styles.header}>
        <input
          className={styles.titleInput}
          placeholder="Título de la nota"
          aria-label="Título de la nota"
          value={title}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
        />
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <div className={styles.toolbar} role="toolbar" aria-label="Formato de la nota">
          <button type="button" className={styles.tool} aria-label="Negrita" onClick={() => run('bold')}>
            <Bold size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Cursiva" onClick={() => run('italic')}>
            <Italic size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Subrayado" onClick={() => run('underline')}>
            <Underline size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Tachado" onClick={() => run('strikeThrough')}>
            <Strikethrough size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Superíndice" onClick={() => run('superscript')}>
            <SuperscriptIcon size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Subíndice" onClick={() => run('subscript')}>
            <SubscriptIcon size={15} />
          </button>
          <select
            className={styles.toolSelect}
            aria-label="Tamaño de texto"
            value={fontSize}
            onChange={(event) => changeFontSize(event.target.value)}
          >
            {['2', '3', '4', '5', '6'].map((size) => (
              <option key={size} value={size}>
                {Number(size) * 3 + 2}
              </option>
            ))}
          </select>
          <button type="button" className={styles.toolHighlight} aria-label="Resaltar" onClick={highlight}>
            A
          </button>
          <button type="button" className={styles.tool} aria-label="Lista con viñetas" onClick={() => run('insertUnorderedList')}>
            <List size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Lista numerada" onClick={() => run('insertOrderedList')}>
            <ListOrdered size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Reducir sangría" onClick={() => run('outdent')}>
            <Outdent size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Aumentar sangría" onClick={() => run('indent')}>
            <Indent size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Insertar enlace" onClick={addLink}>
            <Link2 size={15} />
          </button>
          <span className={styles.toolbarDivider} />
          <button type="button" className={styles.tool} aria-label="Deshacer" onClick={() => run('undo')}>
            <Undo2 size={15} />
          </button>
          <button type="button" className={styles.tool} aria-label="Rehacer" onClick={() => run('redo')}>
            <Redo2 size={15} />
          </button>
        </div>

        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label="Descripción de la nota"
          data-placeholder="Descripción de la nota"
        />

        <div className={styles.footer}>
          <div className={styles.colors} role="radiogroup" aria-label="Color de la nota">
            {NOTE_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={color === item}
                aria-label={`Color ${item}`}
                className={color === item ? styles.colorActive : styles.color}
                style={{ background: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
          <Button
            loading={isAddingOpportunityNote || isEditingOpportunityNote}
            onClick={() => void save()}
          >
            Guardar nota
          </Button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
    </Modal.Window>
  );
};
