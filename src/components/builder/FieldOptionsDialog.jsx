import axios from 'axios';
import { useEffect, useState } from 'react';

const cloneOptions = (options = []) =>
  options.map((option) => ({
    label: option.label ?? '',
    value: option.value ?? '',
  }));

const extractOptionsArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    const nested = data.data ?? data.results ?? data.items ?? data.options ?? data.records;
    if (Array.isArray(nested)) {
      return nested;
    }
  }
  return [];
};

const mapResponseToOptions = (items, labelKey, valueKey) =>
  items.map((item) => {
    if (item == null) {
      return { label: '', value: '' };
    }
    if (typeof item === 'string' || typeof item === 'number') {
      const text = String(item);
      return { label: text, value: text };
    }
    const label = item[labelKey] ?? item.label ?? item.name ?? item.title ?? '';
    const rawValue = item[valueKey] ?? item.value ?? item.id ?? label;
    return {
      label: String(label),
      value: String(rawValue ?? ''),
    };
  });

function FieldOptionsDialog({
  apiEndpoint = '',
  fieldLabel,
  fieldType = 'radio',
  labelKey: initialLabelKey = 'label',
  options = [],
  onClose,
  onSave,
  valueKey: initialValueKey = 'value',
}) {
  const [draft, setDraft] = useState(() => cloneOptions(options));
  const [fetchUrl, setFetchUrl] = useState(apiEndpoint);
  const [labelKey, setLabelKey] = useState(initialLabelKey);
  const [valueKey, setValueKey] = useState(initialValueKey);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setDraft(cloneOptions(options));
  }, [options]);

  useEffect(() => {
    setFetchUrl(apiEndpoint);
    setLabelKey(initialLabelKey || 'label');
    setValueKey(initialValueKey || 'value');
  }, [apiEndpoint, initialLabelKey, initialValueKey]);

  const updateRow = (index, key, nextValue) => {
    setDraft((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: nextValue } : row,
      ),
    );
  };

  const addRow = () => {
    setDraft((current) => {
      const nextIndex = current.length + 1;
      return [
        ...current,
        { label: `Option ${nextIndex}`, value: `option_${nextIndex}` },
      ];
    });
  };

  const removeRow = (index) => {
    setDraft((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleFetchData = async () => {
    const url = fetchUrl.trim();
    if (!url) {
      setFetchError('Enter an API URL to fetch options.');
      return;
    }

    setIsFetching(true);
    setFetchError('');

    try {
      const response = await axios.get(url);
      const items = extractOptionsArray(response.data);
      if (!items.length) {
        setFetchError('No list found in the API response. Expected a JSON array or { data: [...] }.');
        return;
      }
      setDraft(mapResponseToOptions(items, labelKey.trim() || 'label', valueKey.trim() || 'value'));
    } catch (error) {
      setFetchError(error.response?.data?.message || error.message || 'Failed to fetch options.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nextOptions = draft.map((row) => ({
      label: row.label.trim() || row.value.trim() || 'Option',
      value: row.value.trim() || row.label.trim() || 'option',
    }));
    onSave(nextOptions, {
      endpoint: fetchUrl.trim(),
      labelKey: labelKey.trim() || 'label',
      valueKey: valueKey.trim() || 'value',
    });
    onClose();
  };

  const fieldTypeLabels = {
    radio: 'Radio',
    select: 'Select',
    multiselect: 'Multi Select',
  };
  const fieldTypeLabel = fieldTypeLabels[fieldType] || 'Field';

  return (
    <div className="modal-backdrop-shell" role="presentation">
      <div
        aria-labelledby="fieldOptionsDialogTitle"
        aria-modal="true"
        className="modal d-block field-options-modal"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <form className="modal-content border-0 shadow" onSubmit={handleSave}>
            <div className="modal-header">
              <h2 className="h5 mb-0" id="fieldOptionsDialogTitle">
                {fieldTypeLabel} options — {fieldLabel || fieldTypeLabel}
              </h2>
              <button aria-label="Close" className="btn-close" onClick={onClose} type="button" />
            </div>
            <div className="modal-body">
              <p className="small text-muted">
                Set the label (shown to users) and value (saved in form data / JSON).
              </p>
              <div className="field-options-fetch border rounded mb-3">
                <div className="card-body py-3">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <h3 className="h6 mb-0">Fetch data</h3>
                    <span className="small text-muted">Paste API URL and load options</span>
                  </div>
                  <div className="input-group input-group-sm mb-2">
                    <span className="input-group-text">
                      <i className="bi bi-link-45deg" />
                    </span>
                    <input
                      className="form-control"
                      onChange={(event) => setFetchUrl(event.target.value)}
                      placeholder="https://api.example.com/options"
                      spellCheck={false}
                      type="url"
                      value={fetchUrl}
                    />
                    <button
                      className="btn btn-primary"
                      disabled={isFetching}
                      onClick={handleFetchData}
                      type="button"
                    >
                      {isFetching ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                          Fetching…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-download me-1" />
                          Fetch
                        </>
                      )}
                    </button>
                  </div>
                  <div className="row g-2">
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-1">Label key</label>
                      <input
                        className="form-control form-control-sm font-monospace"
                        onChange={(event) => setLabelKey(event.target.value)}
                        placeholder="label"
                        spellCheck={false}
                        type="text"
                        value={labelKey}
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-1">Value key</label>
                      <input
                        className="form-control form-control-sm font-monospace"
                        onChange={(event) => setValueKey(event.target.value)}
                        placeholder="value"
                        spellCheck={false}
                        type="text"
                        value={valueKey}
                      />
                    </div>
                  </div>
                  {fetchError && (
                    <div className="alert alert-danger py-2 px-3 small mb-0 mt-2" role="alert">
                      {fetchError}
                    </div>
                  )}
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle field-options-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Label</th>
                      <th scope="col">Value</th>
                      <th className="text-end" scope="col">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.length === 0 ? (
                      <tr>
                        <td className="text-muted" colSpan={3}>
                          No options yet. Click &quot;Add option&quot; below.
                        </td>
                      </tr>
                    ) : (
                      draft.map((row, index) => (
                        <tr key={`option-row-${index}`}>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              onChange={(event) => updateRow(index, 'label', event.target.value)}
                              placeholder="Option label"
                              type="text"
                              value={row.label}
                            />
                          </td>
                          <td>
                            <input
                              className="form-control form-control-sm font-monospace"
                              onChange={(event) => updateRow(index, 'value', event.target.value)}
                              placeholder="option_value"
                              spellCheck={false}
                              type="text"
                              value={row.value}
                            />
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeRow(index)}
                              title="Delete option"
                              type="button"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-sm btn-outline-primary mt-3" onClick={addRow} type="button">
                <i className="bi bi-plus-lg me-1" />
                Add option
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save options
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </div>
  );
}

export default FieldOptionsDialog;
