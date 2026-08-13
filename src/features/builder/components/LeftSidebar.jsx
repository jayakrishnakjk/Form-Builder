import { FIELD_CATALOG } from '@/shared/constants/fieldCatalog';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useToast } from '@/shared/hooks/useToast';

function LeftSidebar() {
  const { createField, deleteMasterForm, insertMasterForm, masterForms } = useFormBuilder();
  const { showToast } = useToast();

  const renderPaletteButton = (item, key) => (
    <div className="col-12" key={key}>
      <button
        className="btn btn-light border w-100 text-start d-flex align-items-center gap-2 palette-button"
        draggable
        onDragStart={(event) => {
          const payload = { mode: 'create', type: item.type };
          if (item.columnCount) {
            payload.columnCount = item.columnCount;
          }
          if (item.headingLevel) {
            payload.headingLevel = item.headingLevel;
          }
          if (item.masterFormId) {
            payload.masterFormId = item.masterFormId;
          }
          event.dataTransfer.setData('application/json', JSON.stringify(payload));
        }}
        onClick={() => {
          if (item.type === 'masterForm' && item.masterFormId) {
            insertMasterForm(item.masterFormId);
            return;
          }
          createField(item.type, undefined, {
            ...(item.columnCount ? { columnCount: item.columnCount } : {}),
            ...(item.headingLevel ? { headingLevel: item.headingLevel } : {}),
          });
        }}
        type="button"
      >
        <i className={`bi ${item.icon} text-primary`} />
        <span>{item.label}</span>
      </button>
    </div>
  );

  const renderMasterFormItem = (master) => (
    <div className="col-12" key={master.id}>
      <div className="d-flex align-items-stretch gap-1 master-form-palette-row">
        <button
          className="btn btn-light border flex-grow-1 text-start d-flex align-items-center gap-2 palette-button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(
              'application/json',
              JSON.stringify({
                mode: 'create',
                type: 'masterForm',
                masterFormId: master.id,
              }),
            );
          }}
          onClick={() => insertMasterForm(master.id)}
          type="button"
        >
          <i className="bi bi-file-earmark-ruled text-primary" />
          <span className="text-truncate">{master.name}</span>
        </button>
        <button
          aria-label={`Delete ${master.name}`}
          className="btn btn-light border text-danger master-form-delete-btn"
          onClick={() => {
            const deletedName = deleteMasterForm(master.id);
            if (deletedName) {
              showToast(`Master form "${deletedName}" deleted.`, 'success');
            }
          }}
          title="Delete master form"
          type="button"
        >
          <i className="bi bi-trash" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="card border-0 shadow-sm h-100 sticky-xl-top builder-field-library" style={{ top: '90px' }}>
      <div className="card-body d-flex flex-column gap-3 builder-field-library-body">
        <div className="builder-field-library-header">
          <h5 className="mb-0">Drag Fields</h5>
        </div>

        <div className="accordion builder-field-library-accordion" id="fieldLibrary">
          {FIELD_CATALOG.map((group, groupIndex) => (
            <div className="accordion-item" key={group.category}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${groupIndex === 0 ? '' : 'collapsed'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse_${groupIndex}`}
                >
                  {group.category}
                </button>
              </h2>
              <div
                id={`collapse_${groupIndex}`}
                className={`accordion-collapse collapse ${groupIndex === 0 ? 'show' : ''}`}
                data-bs-parent="#fieldLibrary"
              >
                <div className="accordion-body p-2 builder-field-library-panel-scroll">
                  <div className="row g-2">
                    {group.items.map((item) => renderPaletteButton(item, `${item.type}-${item.label}`))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapse_master_form"
              >
                Master Form
              </button>
            </h2>
            <div
              id="collapse_master_form"
              className="accordion-collapse collapse"
              data-bs-parent="#fieldLibrary"
            >
              <div className="accordion-body p-2 builder-field-library-panel-scroll">
                {masterForms.length ? (
                  <div className="row g-2">
                    {masterForms.map((master) => renderMasterFormItem(master))}
                  </div>
                ) : (
                  <p className="small text-muted mb-0 px-1">
                    No master forms yet. Build a layout and click Master Form to save one.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
