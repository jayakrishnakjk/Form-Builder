import { useState } from 'react';
import { CONTAINER_TYPES } from '@/shared/constants/fieldCatalog';
import { getRowSlotTemplate } from '@/shared/constants/defaults';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import FieldOptionsDialog from './FieldOptionsDialog';
import ButtonSettingsDialog from './ButtonSettingsDialog';

const FIELDS_WITH_OPTIONS = new Set(['radio', 'select', 'multiselect']);

const renderOptionsEmptyHint = () => (
  <p className="small text-muted mb-0">
    No options — use <i className="bi bi-gear" /> to add
  </p>
);

const renderNodePreview = (node) => {
  if (CONTAINER_TYPES.includes(node.type)) {
    if (node.type === 'row') {
      return (
        <span className="layout-meta">
          <i className="bi bi-layout-three-columns" />
          Bootstrap row • {node.children?.length || 0} column{(node.children?.length || 0) === 1 ? '' : 's'}
        </span>
      );
    }
    if (node.type === 'column') {
      return (
        <span className="layout-meta">
          <i className="bi bi-columns-gap" />
          col-md-{node.width || 6} • drop fields here
        </span>
      );
    }
    return <span className="small text-muted">Container • {node.children?.length || 0} children</span>;
  }

  if (node.type === 'heading') {
    return <div className="fw-bold">{node.defaultValue || node.label}</div>;
  }

  if (node.type === 'divider') {
    return <hr className="my-2" />;
  }

  if (node.type === 'checkbox' || node.type === 'switch') {
    return (
      <div className="form-check">
        <input className="form-check-input" disabled type="checkbox" />
        <label className="form-check-label">{node.label}</label>
      </div>
    );
  }

  if (node.type === 'radio') {
    const options = node.apiBinding?.options || [];
    if (!options.length) {
      return renderOptionsEmptyHint();
    }
    return (
      <div className="d-flex flex-column gap-1">
        {options.map((option, index) => (
          <div className="form-check mb-0" key={`${option.value}-${index}`}>
            <input className="form-check-input" disabled type="radio" />
            <label className="form-check-label small">{option.label}</label>
          </div>
        ))}
      </div>
    );
  }

  if (node.type === 'select') {
    const options = node.apiBinding?.options || [];
    if (!options.length) {
      return renderOptionsEmptyHint();
    }
    return (
      <select className="form-select form-select-sm" disabled value="">
        <option value="">Select</option>
        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (node.type === 'multiselect') {
    const options = node.apiBinding?.options || [];
    if (!options.length) {
      return renderOptionsEmptyHint();
    }
    return (
      <select className="form-select form-select-sm" disabled multiple size={Math.min(4, Math.max(2, options.length))}>
        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (node.type === 'button') {
    const buttonColor = node.metadata?.buttonColor || '#6610f2';
    return (
      <button
        className="btn btn-sm text-white"
        disabled
        style={{ backgroundColor: buttonColor, borderColor: buttonColor }}
        type="button"
      >
        {node.label || 'Button'}
      </button>
    );
  }

  return (
    <input
      className="form-control form-control-sm"
      disabled
      placeholder={node.placeholder || node.label}
      type="text"
    />
  );
};

function CanvasNode({ node, onDropNode }) {
  const {
    selectedFieldId,
    setSelectedFieldId,
    deleteField,
    updateField,
  } = useFormBuilder();

  const isContainer = CONTAINER_TYPES.includes(node.type);
  const isRow = node.type === 'row';
  const isColumn = node.type === 'column';
  const isLayoutContainer = isRow || isColumn;
  const showRequiredToggle = !isLayoutContainer && node.type !== 'button';
  const isSelected = selectedFieldId === node.id;
  const hasOptionsEditor = FIELDS_WITH_OPTIONS.has(node.type);
  const hasButtonSettingsEditor = node.type === 'button';
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const [buttonSettingsOpen, setButtonSettingsOpen] = useState(false);
  const rowSlotTemplate = isRow ? getRowSlotTemplate(node) : null;
  const remainingRowWidth = isRow
    ? Math.max(
        0,
        12 - (node.children || []).reduce((sum, child) => sum + (Number(child.width) || 6), 0),
      )
    : 0;

  const renderRowColumnSlot = (slotWidth, slotIndex) => (
    <div className={`col-12 col-md-${slotWidth}`} key={`${node.id}-add-slot-${slotIndex}`}>
      <div
        className="row-column-slot"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => {
          event.stopPropagation();
          onDropNode(event, node.id, { columnWidth: slotWidth, insertAtIndex: slotIndex });
        }}
        title="Drop Column here"
      >
        <i className="bi bi-plus-lg" />
        <span>Drop Column</span>
      </div>
    </div>
  );

  return (
    <div
      className={[
        'canvas-node',
        isRow ? 'canvas-node--row' : '',
        isColumn ? 'canvas-node--column' : '',
        isSelected ? 'selected-node' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onClick={(event) => {
        event.stopPropagation();
        setSelectedFieldId(node.id);
      }}
      onDragStart={(event) => {
        if (
          event.target.closest('.canvas-node-inline-input') ||
          event.target.closest('.canvas-node-settings') ||
          event.target.closest('.canvas-node-required-toggle') ||
          event.target.closest('.modal-backdrop-shell')
        ) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData('application/json', JSON.stringify({ mode: 'move', fieldId: node.id }));
      }}
    >
      <div className="canvas-node-header">
        <div className="canvas-node-title">
          <div className="canvas-node-label">
            {isRow && <i className="bi bi-layout-three-columns text-primary" />}
            {isColumn && <i className="bi bi-square text-primary" />}
            {isLayoutContainer ? (
              <span>{node.label || node.type}</span>
            ) : (
              <input
                aria-label="Field label"
                className="canvas-node-label-input canvas-node-inline-input"
                onChange={(event) => {
                  event.stopPropagation();
                  updateField(node.id, { label: event.target.value });
                }}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                placeholder={node.type}
                type="text"
                value={node.label || ''}
              />
            )}
            {isColumn && (
              <span className="width-badge">col-md-{node.width || 6}</span>
            )}
          </div>
          <div className="canvas-node-sub">
            {isLayoutContainer ? (
              <>
                {node.type}
                {node.objectKey ? ` • ${node.objectKey}` : ''}
              </>
            ) : (
              <span className="canvas-node-sub-editable">
                <span className="canvas-node-sub-type">{node.type}</span>
                <span aria-hidden="true" className="canvas-node-sub-sep">
                  •
                </span>
                <input
                  aria-label="Field object key"
                  className="canvas-node-sub-input canvas-node-inline-input"
                  onChange={(event) => {
                    event.stopPropagation();
                    const nextKey = event.target.value;
                    updateField(node.id, { objectKey: nextKey, name: nextKey });
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  placeholder="object_key"
                  spellCheck={false}
                  type="text"
                  value={node.objectKey || ''}
                />
              </span>
            )}
          </div>
        </div>
        <div className="canvas-node-header-actions">
          {showRequiredToggle && (
            <label
              className="canvas-node-required-toggle"
              title="Required field"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <input
                checked={Boolean(node.required || node.validation?.required)}
                className="form-check-input"
                onChange={(event) => {
                  event.stopPropagation();
                  const required = event.target.checked;
                  updateField(node.id, {
                    required,
                    validation: {
                      ...(node.validation || {}),
                      required,
                    },
                  });
                }}
                type="checkbox"
              />
              <span className="canvas-node-required-label">Req</span>
            </label>
          )}
          {hasOptionsEditor && (
            <button
              className="btn btn-sm canvas-node-settings"
              onClick={(event) => {
                event.stopPropagation();
                setOptionsDialogOpen(true);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              title={`Edit ${node.type} options`}
              type="button"
            >
              <i className="bi bi-gear" />
            </button>
          )}
          {hasButtonSettingsEditor && (
            <button
              className="btn btn-sm canvas-node-settings"
              onClick={(event) => {
                event.stopPropagation();
                setButtonSettingsOpen(true);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              title="Button settings"
              type="button"
            >
              <i className="bi bi-gear" />
            </button>
          )}
          <button
            className="btn btn-sm canvas-node-delete"
            onClick={(event) => {
              event.stopPropagation();
              deleteField(node.id);
            }}
            title="Delete"
            type="button"
          >
            <i className="bi bi-trash" />
          </button>
        </div>
      </div>

      {!isRow && (
        <div className="canvas-node-body">
          {renderNodePreview(node)}
          {node.description && <p className="small text-muted mt-2 mb-0">{node.description}</p>}
        </div>
      )}

      {isContainer && (
        <div
          className={`nested-dropzone ${isRow ? 'nested-dropzone--row' : ''} ${isColumn ? 'nested-dropzone--column' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.stopPropagation();
            onDropNode(event, node.id);
          }}
        >
          {isRow && (
            <div className="nested-dropzone-label">
              <span>Row layout</span>
              <span className="nested-dropzone-hint">md columns side-by-side</span>
            </div>
          )}
          {!isRow && !isColumn && (
            <div className="small text-uppercase text-muted mb-2">Nested children</div>
          )}
          {isColumn && node.children?.length === 0 && null}
          {node.children?.length ? (
            isRow ? (
              <div className="row g-2 builder-row-grid">
                {rowSlotTemplate ? (
                  rowSlotTemplate.map((slotWidth, slotIndex) => {
                    const child = node.children[slotIndex];
                    if (child) {
                      return (
                        <div
                          className={`col-12 col-md-${child.width || slotWidth}`}
                          key={child.id}
                        >
                          <CanvasNode node={child} onDropNode={onDropNode} />
                        </div>
                      );
                    }
                    return renderRowColumnSlot(slotWidth, slotIndex);
                  })
                ) : (
                  <>
                    {node.children.map((child) => (
                      <div
                        className={`col-12 col-md-${child.width || Math.floor(12 / node.children.length) || 6}`}
                        key={child.id}
                      >
                        <CanvasNode node={child} onDropNode={onDropNode} />
                      </div>
                    ))}
                    {remainingRowWidth > 0 && renderRowColumnSlot(remainingRowWidth, node.children.length)}
                  </>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {node.children.map((child) => (
                  <CanvasNode key={child.id} node={child} onDropNode={onDropNode} />
                ))}
              </div>
            )
          ) : (
            <div className={`empty-nested-state ${isRow ? 'empty-nested-state--row' : ''} ${isColumn ? 'empty-nested-state--column' : ''}`}>
              {isRow && (
                <>
                  <div className="empty-row-slots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Drop 2Column / 3Column here for a horizontal md layout</p>
                </>
              )}
              {isColumn && <p>Drop fields into this column</p>}
              {!isRow && !isColumn && <p>Drop components into this container</p>}
            </div>
          )}
        </div>
      )}
      {buttonSettingsOpen && (
        <ButtonSettingsDialog
          apiUrl={node.metadata?.apiUrl || ''}
          buttonColor={node.metadata?.buttonColor || '#6610f2'}
          fieldLabel={node.label}
          onClose={() => setButtonSettingsOpen(false)}
          onSave={(settings) => {
            updateField(node.id, {
              metadata: {
                ...(node.metadata || {}),
                buttonColor: settings.buttonColor,
                apiUrl: settings.apiUrl,
                successToastMessage: settings.successToastMessage,
              },
            });
          }}
          successToastMessage={node.metadata?.successToastMessage || ''}
        />
      )}
      {optionsDialogOpen && (
        <FieldOptionsDialog
          apiEndpoint={node.apiBinding?.endpoint || ''}
          fieldLabel={node.label}
          fieldType={node.type}
          labelKey={node.apiBinding?.labelKey || 'label'}
          onClose={() => setOptionsDialogOpen(false)}
          onSave={(nextOptions, meta) => {
            updateField(node.id, {
              apiBinding: {
                ...(node.apiBinding || {}),
                sourceType: 'static',
                options: nextOptions,
                endpoint: meta?.endpoint ?? node.apiBinding?.endpoint ?? '',
                labelKey: meta?.labelKey ?? node.apiBinding?.labelKey ?? 'label',
                valueKey: meta?.valueKey ?? node.apiBinding?.valueKey ?? 'value',
              },
            });
          }}
          options={node.apiBinding?.options || []}
          valueKey={node.apiBinding?.valueKey || 'value'}
        />
      )}
    </div>
  );
}

export default CanvasNode;
