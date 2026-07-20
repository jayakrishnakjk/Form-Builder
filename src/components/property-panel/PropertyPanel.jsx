import { FORM_EVENTS } from '../../constants/fieldCatalog';
import { useFormBuilder } from '../../hooks/useFormBuilder';

const parseMaybeJson = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

function JsonArea({ label, value, onCommit, rows = 5 }) {
  return (
    <div>
      <label className="form-label small fw-semibold">{label}</label>
      <textarea
        className="form-control font-monospace small"
        defaultValue={JSON.stringify(value || {}, null, 2)}
        rows={rows}
        onBlur={(event) => onCommit(parseMaybeJson(event.target.value, value || {}))}
      />
    </div>
  );
}

function PropertyPanel() {
  const { activeForm, selectedField, updateField, updateFormMeta } = useFormBuilder();

  if (!selectedField) {
    return
  }

  const handleChange = (key, value) => updateField(selectedField.id, { [key]: value });
  const handleNestedChange = (section, key, value) => updateField(selectedField.id, {
    [section]: {
      ...(selectedField[section] || {}),
      [key]: value,
    },
  });

  return
}

export default PropertyPanel;
