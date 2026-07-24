import { useRef, useState } from 'react';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';

function JsonImportCard() {
  const { importCurrentFormJson, exportCurrentFormJson } = useFormBuilder();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const preApplyJsonRef = useRef(null);

  const handleApply = () => {
    const text = jsonText.trim();
    if (!text) {
      setError('Paste form JSON, then click Apply JSON to Canvas.');
      setApplied(false);
      return;
    }

    try {
      // Keep the canvas state from before the first apply so Clear can restore it.
      if (!preApplyJsonRef.current) {
        preApplyJsonRef.current = exportCurrentFormJson(true);
      }
      importCurrentFormJson(text);
      setError('');
      setApplied(true);
    } catch (err) {
      setApplied(false);
      setError(err?.message || 'Invalid JSON. Please paste a valid form JSON.');
    }
  };

  const handleClear = () => {
    setJsonText('');
    setError('');

    // Undo canvas changes that came from Apply JSON.
    if (preApplyJsonRef.current) {
      try {
        importCurrentFormJson(preApplyJsonRef.current);
      } catch {
        // If restore JSON is somehow invalid, leave canvas as-is.
      }
      preApplyJsonRef.current = null;
    }

    setApplied(false);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h5 className="mb-1">Paste JSON</h5>
            <p className="text-muted small mb-0">
              Paste form JSON, then click Apply JSON to Canvas. Clear removes the JSON and undoes the applied canvas design.
            </p>
          </div>
          {applied && (
            <span className="badge text-bg-success align-self-center">
              <i className="bi bi-check-circle me-1" />
              Applied
            </span>
          )}
        </div>

        <textarea
          className={`form-control font-monospace small ${error ? 'is-invalid' : ''}`}
          rows={12}
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value);
            setError('');
          }}
          placeholder='Paste form JSON here, then click Apply JSON to Canvas'
          spellCheck={false}
        />

        {error && <div className="invalid-feedback d-block">{error}</div>}

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={handleApply} type="button">
            <i className="bi bi-box-arrow-in-down me-2" />
            Apply JSON to Canvas
          </button>
          <button className="btn btn-outline-secondary" onClick={handleClear} type="button">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default JsonImportCard;
