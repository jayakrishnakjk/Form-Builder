import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_BUTTON_COLOR = '#6610f2';

function ButtonSettingsDialog({
  apiUrl = '',
  buttonColor = DEFAULT_BUTTON_COLOR,
  fieldLabel,
  onClose,
  onSave,
  successToastMessage = '',
}) {
  const [color, setColor] = useState(buttonColor || DEFAULT_BUTTON_COLOR);
  const [url, setUrl] = useState(apiUrl);
  const [toastMessage, setToastMessage] = useState(successToastMessage);

  useEffect(() => {
    setColor(buttonColor || DEFAULT_BUTTON_COLOR);
    setUrl(apiUrl);
    setToastMessage(successToastMessage);
  }, [apiUrl, buttonColor, successToastMessage]);

  const handleSave = (event) => {
    event.preventDefault();
    onSave({
      buttonColor: color || DEFAULT_BUTTON_COLOR,
      apiUrl: url.trim(),
      successToastMessage: toastMessage.trim(),
    });
    onClose();
  };

  return createPortal(
    <div
      className="modal-backdrop-shell field-options-modal-shell"
      onDragStart={(event) => event.preventDefault()}
      role="presentation"
    >
      <div
        aria-labelledby="buttonSettingsDialogTitle"
        aria-modal="true"
        className="modal d-block field-options-modal"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content border-0 shadow" onSubmit={handleSave}>
            <div className="modal-header">
              <h2 className="h5 mb-0" id="buttonSettingsDialogTitle">
                Button settings — {fieldLabel || 'Button'}
              </h2>
              <button aria-label="Close" className="btn-close" onClick={onClose} type="button" />
            </div>
            <div className="modal-body d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold">Button color</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    className="form-control form-control-color"
                    onChange={(event) => setColor(event.target.value)}
                    type="color"
                    value={color}
                  />
                  <input
                    className="form-control form-control-sm font-monospace"
                    onChange={(event) => setColor(event.target.value)}
                    placeholder="#6610f2"
                    spellCheck={false}
                    type="text"
                    value={color}
                  />
                  <button
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: color, borderColor: color }}
                    type="button"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label small fw-semibold">API URL (on click)</label>
                <input
                  className="form-control"
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://api.example.com/action"
                  spellCheck={false}
                  type="url"
                  value={url}
                />
                <div className="form-text">Called when the button is clicked in Preview.</div>
              </div>
              <div>
                <label className="form-label small fw-semibold">Success toast message</label>
                <input
                  className="form-control"
                  onChange={(event) => setToastMessage(event.target.value)}
                  placeholder="Action completed successfully."
                  type="text"
                  value={toastMessage}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save settings
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

export default ButtonSettingsDialog;
