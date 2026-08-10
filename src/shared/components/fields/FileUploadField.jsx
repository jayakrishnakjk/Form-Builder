import { useId, useRef } from 'react';

function FileUploadField({ field, onChange, disabled, value = [] }) {
  const { multiple = true, maxFileSizeMb = 5, allowedExtensions = [] } = field.metadata || {};
  const inputRef = useRef(null);
  const inputId = useId();

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

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const summary = value.length
    ? `${value.length} file${value.length === 1 ? '' : 's'} selected`
    : 'No file chosen';

  return (
    <div className={`form-file-upload ${disabled ? 'is-disabled' : ''}`}>
      <input
        accept={
          allowedExtensions.length
            ? allowedExtensions.map((ext) => `.${ext}`).join(',')
            : undefined
        }
        className="form-file-upload-input"
        disabled={disabled}
        id={inputId}
        multiple={multiple}
        onChange={handleFiles}
        ref={inputRef}
        type="file"
      />
      <button
        className="form-file-upload-trigger"
        disabled={disabled}
        onClick={openPicker}
        type="button"
      >
        <span className="form-file-upload-icon">
          <i className="bi bi-cloud-arrow-up" />
        </span>
        <span className="form-file-upload-copy">
          <span className="form-file-upload-title">
            {multiple ? 'Choose files' : 'Choose file'}
          </span>
          <span className="form-file-upload-summary">{summary}</span>
        </span>
        <span className="form-file-upload-browse">Browse</span>
      </button>
      <div className="form-file-upload-hint">
        Max {maxFileSizeMb}MB • Allowed: {allowedExtensions.join(', ') || 'all'}
      </div>
      {!!value.length && (
        <div className="form-file-upload-list">
          {value.map((file) => (
            <div className="form-file-upload-item" key={`${file.name}-${file.size}`}>
              <div className="form-file-upload-item-meta">
                <div className="form-file-upload-item-name">{file.name}</div>
                <div className="form-file-upload-item-size">{Math.round(file.size / 1024)} KB</div>
              </div>
              {file.previewUrl && (
                <img alt={file.name} className="upload-preview-thumb rounded" src={file.previewUrl} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploadField;
