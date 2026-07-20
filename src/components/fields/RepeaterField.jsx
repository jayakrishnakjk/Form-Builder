function RepeaterField({ field, value = [], onChange, disabled }) {
  const nestedFields = field.metadata?.fields || [];

  const addRow = () => {
    const record = Object.fromEntries(nestedFields.map((nestedField) => [nestedField.objectKey, nestedField.defaultValue || '']));
    onChange([...(value || []), record]);
  };

  const updateValue = (rowIndex, key, nextValue) => {
    onChange(value.map((row, index) => (index === rowIndex ? { ...row, [key]: nextValue } : row)));
  };

  const removeRow = (rowIndex) => onChange(value.filter((_, index) => index !== rowIndex));

  return (
    <div className="border rounded-3 p-3 bg-light-subtle">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-semibold">Repeater Rows</div>
        <button className="btn btn-outline-primary btn-sm" disabled={disabled} onClick={addRow} type="button">Add Row</button>
      </div>

      <div className="d-flex flex-column gap-3">
        {(value || []).map((row, rowIndex) => (
          <div className="border rounded-3 p-3 bg-white" key={`repeat-${rowIndex}`}>
            <div className="row g-3">
              {nestedFields.map((nestedField) => (
                <div className="col-12 col-md-6" key={nestedField.id}>
                  <label className="form-label small fw-semibold">{nestedField.label}</label>
                  <input
                    className="form-control"
                    disabled={disabled}
                    type={nestedField.type === 'number' ? 'number' : 'text'}
                    value={row[nestedField.objectKey] || ''}
                    onChange={(event) => updateValue(rowIndex, nestedField.objectKey, event.target.value)}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-outline-danger btn-sm mt-3" disabled={disabled} onClick={() => removeRow(rowIndex)} type="button">Delete Row</button>
          </div>
        ))}
        {!value?.length && <div className="text-muted small text-center py-3">No repeater rows yet.</div>}
      </div>
    </div>
  );
}

export default RepeaterField;
