import { CONTAINER_TYPES } from '../../constants/fieldCatalog';
import { getRowSlotTemplate } from '../../constants/defaults';
import { useFormBuilder } from '../../hooks/useFormBuilder';

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
  } = useFormBuilder();

  const isContainer = CONTAINER_TYPES.includes(node.type);
  const isRow = node.type === 'row';
  const isColumn = node.type === 'column';
  const isSelected = selectedFieldId === node.id;
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
        event.dataTransfer.setData('application/json', JSON.stringify({ mode: 'move', fieldId: node.id }));
      }}
    >
      <div className="canvas-node-header">
        <div className="canvas-node-title">
          <div className="canvas-node-label">
            {isRow && <i className="bi bi-layout-three-columns text-primary" />}
            {isColumn && <i className="bi bi-square text-primary" />}
            <span>{node.label || node.type}</span>
            {isColumn && (
              <span className="width-badge">col-md-{node.width || 6}</span>
            )}
          </div>
          <div className="canvas-node-sub">
            {node.type}
            {node.objectKey ? ` • ${node.objectKey}` : ''}
          </div>
        </div>
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
    </div>
  );
}

export default CanvasNode;
