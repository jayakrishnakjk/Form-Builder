import CanvasNode from './CanvasNode';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';

function Canvas() {
  const { activeForm, setSelectedFieldId, createField, insertMasterForm, moveFieldToParent } = useFormBuilder();

  const handleDrop = (event, parentId = 'root', dropOptions = {}) => {
    event.preventDefault();
    let payload;
    try {
      payload = JSON.parse(event.dataTransfer.getData('application/json'));
    } catch {
      return;
    }
    if (payload.mode === 'create') {
      if (payload.type === 'masterForm' && payload.masterFormId) {
        insertMasterForm(payload.masterFormId, parentId, dropOptions);
        return;
      }
      createField(payload.type, parentId, {
        columnCount: payload.columnCount,
        headingLevel: payload.headingLevel,
        ...dropOptions,
      });
    }
    if (payload.mode === 'move') {
      moveFieldToParent(payload.fieldId, parentId, dropOptions);
    }
  };

  return (
    <div className="card border-0 shadow-sm h-20">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">Builder Canvas</h5>
          </div>
        </div>

        <div
          className="canvas-dropzone rounded-4 p-3"
          onClick={() => setSelectedFieldId(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, 'root')}
        >
          {(activeForm?.layout?.children?.length ?? 0) > 0 ? (
            <div className="d-flex flex-column gap-3">
              {activeForm.layout.children.map((node) => (
                <CanvasNode key={node.id} node={node} onDropNode={handleDrop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inboxes display-4 d-block mb-3 text-primary" />
              Drop Fields.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Canvas;
