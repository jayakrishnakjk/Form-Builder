import { FIELD_CATALOG } from '@/shared/constants/fieldCatalog';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';

function LeftSidebar() {
  const { createField } = useFormBuilder();

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
                    {group.items.map((item) => (
                      <div className="col-12" key={`${item.type}-${item.label}`}>
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
                            event.dataTransfer.setData('application/json', JSON.stringify(payload));
                          }}
                          onClick={() =>
                            createField(
                              item.type,
                              undefined,
                              {
                                ...(item.columnCount ? { columnCount: item.columnCount } : {}),
                                ...(item.headingLevel ? { headingLevel: item.headingLevel } : {}),
                              },
                            )
                          }
                          type="button"
                        >
                          <i className={`bi ${item.icon} text-primary`} />
                          <span>{item.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
