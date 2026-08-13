import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function MasterFormDialog({ hasCanvasContent = false, onClose, onSave }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName('');
    setError('');
  }, []);

  const handleSave = (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Form name is required.');
      return;
    }

    if (!hasCanvasContent) {
      setError('Add at least one field to the canvas before saving a master form.');
      return;
    }

    onSave(trimmed);
  };

  return createPortal(
    <div
      className="modal-backdrop-shell field-options-modal-shell"
      onDragStart={(event) => event.preventDefault()}
      role="presentation"
    >
      <div
        aria-labelledby="masterFormDialogTitle"
        aria-modal="true"
        className="modal d-block field-options-modal"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content border-0 shadow" onSubmit={handleSave}>
            <div className="modal-header">
              <h2 className="h5 mb-0" id="masterFormDialogTitle">
                Save Master Form
              </h2>
              <button aria-label="Close" className="btn-close" onClick={onClose} type="button" />
            </div>
            <div className="modal-body">
              <p className="small text-muted mb-3">
                Save the current canvas layout as a reusable master form in the Master Form section.
              </p>
              <label className="form-label" htmlFor="masterFormName">
                Form name
              </label>
              <input
                autoFocus
                className={`form-control ${error ? 'is-invalid' : ''}`}
                id="masterFormName"
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                placeholder="Enter master form name"
                type="text"
                value={name}
              />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </div>,
    document.body,
  );
}

export default MasterFormDialog;
