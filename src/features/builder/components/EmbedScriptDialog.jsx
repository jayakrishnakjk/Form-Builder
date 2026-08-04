import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/shared/hooks/useToast';
import { buildEmbedScript } from '@/shared/utils/embedScript';

function EmbedScriptDialog({ formId, formName, onClose }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const embedScript = useMemo(
    () =>
      buildEmbedScript({
        formId,
        formName,
      }),
    [formId, formName],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedScript);
      setCopied(true);
      showToast('Embed script copied to clipboard.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy embed script.', 'error');
    }
  };

  return createPortal(
    <div
      className="modal-backdrop-shell field-options-modal-shell"
      onDragStart={(event) => event.preventDefault()}
      role="presentation"
    >
      <div
        aria-labelledby="embedScriptDialogTitle"
        aria-modal="true"
        className="modal d-block field-options-modal"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <div>
                <h2 className="h5 mb-1" id="embedScriptDialogTitle">
                  Embed Snippet
                </h2>
                <p className="text-muted small mb-0">
                  Copy the HTML script for {formName || 'this form'} and add it to your site.
                </p>
              </div>
              <button aria-label="Close" className="btn-close" onClick={onClose} type="button" />
            </div>
            <div className="modal-body d-flex flex-column gap-3">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h3 className="h6 mb-0">HTML</h3>
                  <button className="btn btn-sm btn-outline-light embed-copy-btn" onClick={handleCopy} type="button">
                    <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} />
                  </button>
                </div>
                <pre className="embed-script-block mb-0">
                  <code>{embedScript}</code>
                </pre>
              </div>
              <p className="text-muted small mb-0">
                Save the form before sharing. Other sites will load this form from{' '}
                <span className="font-monospace">/embed/{formId}</span>.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} type="button">
                Close
              </button>
              <button className="btn btn-primary" onClick={handleCopy} type="button">
                Copy HTML Script
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </div>,
    document.body,
  );
}

export default EmbedScriptDialog;
