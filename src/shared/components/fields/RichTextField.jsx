import { useEffect, useRef } from 'react';

const COMMANDS = [
  ['bold', 'Bold', 'bi-type-bold'],
  ['italic', 'Italic', 'bi-type-italic'],
  ['underline', 'Underline', 'bi-type-underline'],
  ['insertUnorderedList', 'Bullets', 'bi-list-ul'],
  ['insertOrderedList', 'Numbered List', 'bi-list-ol'],
  ['createLink', 'Link', 'bi-link-45deg'],
];

function RichTextField({ value, onChange, disabled }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const runCommand = (command) => {
    if (command === 'createLink') {
      const url = window.prompt('Enter URL');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false);
    }
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="border rounded-3 overflow-hidden">
      <div className="btn-toolbar gap-1 p-2 border-bottom bg-body-tertiary flex-wrap">
        {COMMANDS.map(([command, label, icon]) => (
          <button key={command} className="btn btn-sm btn-light border" disabled={disabled} onClick={() => runCommand(command)} type="button">
            <i className={`bi ${icon}`} /> <span className="d-none d-md-inline">{label}</span>
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="p-3 rich-text-editor"
        contentEditable={!disabled}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default RichTextField;
