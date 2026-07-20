function FileUploadField({ field, onChange, disabled, value = [] }) {
  const { multiple = true, maxFileSizeMb = 5, allowedExtensions = [] } = field.metadata || {};

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    const accepted = files
      .filter((file) => file.size / 1024 / 1024 <= maxFileSizeMb)
      .filter((file) => {
        if (!allowedExtensions.length) {
          return true;
        }
        const extension = file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(extension);
      })
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      }));

    onChange(accepted);
  };

  return (
    <div className="border rounded-3 p-3 bg-light-subtle">
      <input className="form-control" disabled={disabled} multiple={multiple} onChange={handleFiles} type="file" />
      <div className="small text-muted mt-2">
        Max {maxFileSizeMb}MB • Allowed: {allowedExtensions.join(', ') || 'all'}
      </div>
      {!!value.length && (
        <div className="row g-2 mt-2">
          {value.map((file) => (
            <div className="col-12" key={`${file.name}-${file.size}`}>
              <div className="border rounded p-2 bg-white d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold small">{file.name}</div>
                  <div className="text-muted small">{Math.round(file.size / 1024)} KB</div>
                </div>
                {file.previewUrl && <img alt={file.name} className="upload-preview-thumb rounded" src={file.previewUrl} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploadField;
