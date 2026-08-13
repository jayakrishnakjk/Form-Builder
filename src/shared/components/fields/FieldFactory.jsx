import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/shared/services/apiClient';
import DynamicTableField from './DynamicTableField';
import FileUploadField from './FileUploadField';
import RepeaterField from './RepeaterField';
import RichTextField from './RichTextField';
import SignaturePadField from './SignaturePadField';
import { resolveButtonAction } from '@/shared/utils/buttonActions';

const normalizeOptions = (field, responseData, formData) => {
  if (field.apiBinding?.sourceType === 'api' && Array.isArray(responseData)) {
    return responseData.map((item) => ({
      label: item[field.apiBinding?.labelKey || 'label'] ?? item.label ?? item.name,
      value: item[field.apiBinding?.valueKey || 'value'] ?? item.value ?? item.id,
    }));
  }

  if (field.apiBinding?.sourceType === 'dependent') {
    const options = field.apiBinding?.options || [];
    return options.filter((option) => {
      if (!field.apiBinding?.parentKey) {
        return true;
      }
      return option.parentValue === formData[field.apiBinding.parentKey];
    });
  }

  return field.apiBinding?.options || [];
};

function RatingControl({ field, value = 0, onChange, disabled }) {
  return (
    <div className="d-flex gap-1 fs-4 text-warning">
      {Array.from({ length: Number(field.metadata?.maxRating || 5) }).map((_, index) => {
        const starNumber = index + 1;
        return (
          <button className="btn btn-link p-0 text-warning" disabled={disabled} key={starNumber} onClick={() => onChange(starNumber)} type="button">
            <i className={`bi ${starNumber <= Number(value || 0) ? 'bi-star-fill' : 'bi-star'}`} />
          </button>
        );
      })}
    </div>
  );
}

function FieldFactory({ field, value, error, onChange, onBlur, onClick, formData = {}, disabled = false }) {
  const [options, setOptions] = useState(() => normalizeOptions(field, [], formData));

  const parentKey = field.apiBinding?.parentKey;
  const parentValue = parentKey ? formData[parentKey] : undefined;

  useEffect(() => {
    const loadOptions = async () => {
      if (field.apiBinding?.sourceType === 'api' && field.apiBinding.endpoint) {
        try {
          const response = await apiClient({
            url: field.apiBinding.endpoint,
            method: field.apiBinding.method || 'GET',
          });
          setOptions(normalizeOptions(field, response.data, formData));
        } catch {
          setOptions(field.apiBinding?.options || []);
        }
      } else {
        setOptions(normalizeOptions(field, [], formData));
      }
    };

    loadOptions();
    // field + formData intentionally narrowed to stable keys to avoid refetch loops.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [
    field.apiBinding?.endpoint,
    field.apiBinding?.method,
    field.apiBinding?.sourceType,
    field.apiBinding?.options,
    field.id,
    parentValue,
  ]);

  const commonProps = useMemo(
    () => ({
      className: `form-control ${error ? 'is-invalid' : ''} ${field.className || ''}`,
      disabled: disabled || field.disabled,
      onBlur,
      placeholder: field.placeholder,
      readOnly: field.readonly,
      style: field.style,
      value: value ?? '',
    }),
    [disabled, error, field, onBlur, value],
  );

  const renderControl = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'phone':
      case 'hidden':
      case 'date':
      case 'time':
        return <input {...commonProps} onChange={(event) => onChange(event.target.value)} type={field.type === 'phone' ? 'tel' : field.type} />;
      case 'datetime':
        return <input {...commonProps} onChange={(event) => onChange(event.target.value)} type="datetime-local" />;
      case 'number':
        return <input {...commonProps} onChange={(event) => onChange(event.target.value)} step={field.validation?.decimal ? '0.01' : '1'} type="number" />;
      case 'textarea':
        return <textarea {...commonProps} onChange={(event) => onChange(event.target.value)} rows="4" />;
      case 'checkbox':
        return <div className="form-check"><input checked={Boolean(value)} className={`form-check-input ${error ? 'is-invalid' : ''}`} disabled={disabled || field.disabled} onChange={(event) => onChange(event.target.checked)} type="checkbox" /> <label className="form-check-label">{field.label}</label></div>;
      case 'switch':
        return <div className="form-check form-switch"><input checked={Boolean(value)} className={`form-check-input ${error ? 'is-invalid' : ''}`} disabled={disabled || field.disabled} onChange={(event) => onChange(event.target.checked)} type="checkbox" /> <label className="form-check-label">{field.label}</label></div>;
      case 'radio':
        return (
          <div className="d-flex flex-column gap-2">
            {options.map((option) => (
              <div className="form-check" key={option.value}>
                <input checked={value === option.value} className="form-check-input" disabled={disabled || field.disabled} name={field.objectKey} onChange={() => onChange(option.value)} type="radio" />
                <label className="form-check-label">{option.label}</label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <select className={`form-select ${error ? 'is-invalid' : ''}`} disabled={disabled || field.disabled} onChange={(event) => onChange(event.target.value)} value={value || ''}>
            <option value="">Select</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        );
      case 'multiselect':
        return (
          <select className={`form-select ${error ? 'is-invalid' : ''}`} disabled={disabled || field.disabled} multiple onChange={(event) => onChange(Array.from(event.target.selectedOptions).map((option) => option.value))} value={value || []}>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        );
      case 'autocomplete':
        return (
          <>
            <input {...commonProps} list={`${field.id}_list`} onChange={(event) => onChange(event.target.value)} />
            <datalist id={`${field.id}_list`}>
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </datalist>
          </>
        );
      case 'rating':
        return <RatingControl disabled={disabled || field.disabled} field={field} onChange={onChange} value={value} />;
      case 'signature':
        return <SignaturePadField disabled={disabled || field.disabled} onChange={onChange} penColor={field.metadata?.penColor} value={value} />;
      case 'richtext':
        return <RichTextField disabled={disabled || field.disabled} onChange={onChange} value={value} />;
      case 'file':
      case 'image':
        return <FileUploadField disabled={disabled || field.disabled} field={field} onChange={onChange} value={value} />;
      case 'heading': {
        const Tag = field.metadata?.level || 'h4';
        return <Tag className="mb-0">{field.defaultValue || field.label}</Tag>;
      }
      case 'paragraph':
        return <p className="mb-0">{field.defaultValue || field.label}</p>;
      case 'divider':
        return <hr className="my-2" />;
      case 'html':
        return <div className="p-3 rounded bg-body-tertiary" dangerouslySetInnerHTML={{ __html: field.defaultValue || '' }} />;
      case 'dynamicTable':
        return <DynamicTableField disabled={disabled || field.disabled} field={field} onChange={onChange} value={value || []} />;
      case 'repeater':
        return <RepeaterField disabled={disabled || field.disabled} field={field} onChange={onChange} value={value || []} />;
      case 'button': {
        const action = resolveButtonAction(field);
        const buttonColor = field.metadata?.buttonColor;
        const useCustomColor = Boolean(buttonColor);
        const variantClass =
          field.metadata?.variant === 'secondary'
            ? 'btn-outline-secondary'
            : field.metadata?.variant === 'outline'
              ? 'btn-outline-primary'
              : 'btn-primary';
        const htmlType = action === 'submit' ? 'submit' : action === 'reset' ? 'reset' : 'button';
        return (
          <button
            className={`btn ${useCustomColor ? 'text-white' : variantClass} ${field.className || ''}`.trim()}
            disabled={disabled || field.disabled}
            onClick={onClick}
            style={
              useCustomColor
                ? { backgroundColor: buttonColor, borderColor: buttonColor }
                : undefined
            }
            type={htmlType}
          >
            {field.label || 'Button'}
          </button>
        );
      }
      default:
        return <input {...commonProps} onChange={(event) => onChange(event.target.value)} type="text" />;
    }
  };

  if (field.type === 'hidden') {
    return <input type="hidden" value={value || ''} />;
  }

  return (
    <div>
      {!['checkbox', 'switch', 'heading', 'paragraph', 'divider', 'html', 'button'].includes(field.type) && (
        <label className="form-label fw-semibold">
          {field.label} {(field.required || field.validation?.required) && <span className="text-danger">*</span>}
        </label>
      )}
      {renderControl()}
      {field.helpText && <div className="form-text">{field.helpText}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default FieldFactory;
