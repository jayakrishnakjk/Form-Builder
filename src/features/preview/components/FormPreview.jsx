import { useEffect, useMemo, useState } from 'react';
import FieldFactory from '@/shared/components/fields/FieldFactory';
import { apiClient } from '@/shared/services/apiClient';
import { useToast } from '@/shared/hooks/useToast';
import { CONTAINER_TYPES } from '@/shared/constants/fieldCatalog';
import { applyFormulas } from '@/shared/utils/formulaEngine';
import { executeEventScript, getRuntimeFieldState } from '@/shared/utils/logicEngine';
import { flattenFields } from '@/shared/utils/tree';
import { buildFormPayload, createFormDataFromLayout } from '@/shared/utils/formPayload';
import { validateField, validateForm } from '@/shared/utils/validationEngine';
import { resolveButtonAction } from '@/shared/utils/buttonActions';
import {
  groupChildrenForButtonLayout,
  shouldInlineButtons,
} from '@/shared/utils/inlineButtonsLayout';

const createInitialData = (children = []) => createFormDataFromLayout(children);

const EMPTY_LAYOUT_CHILDREN = [];

function FormPreview({ form, onSubmitted }) {
  const { showToast } = useToast();
  const layoutChildren = form?.layout?.children ?? EMPTY_LAYOUT_CHILDREN;
  const [formData, setFormData] = useState(() => createInitialData(layoutChildren));
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const flatFields = useMemo(() => flattenFields(layoutChildren), [layoutChildren]);

  useEffect(() => {
    const defaults = applyFormulas(flatFields, createInitialData(layoutChildren));
    setFormData(defaults);
    setErrors({});
    flatFields.forEach((field) => executeEventScript(field.events?.onLoad, { field, formData: defaults }));
  }, [flatFields, layoutChildren]);

  const handleFieldChange = (field, nextValue) => {
    const nextData = applyFormulas(flatFields, {
      ...formData,
      [field.objectKey]: nextValue,
    });
    setFormData(nextData);
    setErrors((current) => ({
      ...current,
      [field.objectKey]: validateField(field, nextValue, nextData),
    }));
    executeEventScript(field.events?.onChange, { field, value: nextValue, formData: nextData });
  };

  const callButtonApi = async (field) => {
    const rawUrl = field.metadata?.apiUrl?.trim();
    if (!rawUrl) {
      return { called: false, ok: true };
    }

    const apiUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    try {
      await apiClient.post(apiUrl, buildFormPayload(formData, layoutChildren));
      showToast(
        field.metadata?.successToastMessage?.trim() || 'Action completed successfully.',
        'success',
      );
      return { called: true, ok: true };
    } catch (error) {
      showToast(
        error.response?.data?.message || error.message || 'API call failed.',
        'error',
      );
      return { called: true, ok: false };
    }
  };

  const handleButtonClick = async (field) => {
    executeEventScript(field.events?.onClick, { field, formData });
    await callButtonApi(field);
  };

  const renderNode = (node, parentType = 'root', inheritedButtonsInline = false, inlineButton = false) => {
    const runtime = getRuntimeFieldState(node, formData);
    if (runtime.hidden) {
      return null;
    }

    if (CONTAINER_TYPES.includes(node.type)) {
      if (node.type === 'row') {
        const inheritInline = Boolean(node.metadata?.buttonsInline);
        const children = node.children?.map((child) => renderNode(child, node.type, inheritInline));
        return <div className="row g-3 mb-3" key={node.id}>{children}</div>;
      }
      if (node.type === 'column') {
        const buttonsInline = shouldInlineButtons(node, inheritedButtonsInline);
        const hasChildren = Boolean(node.children?.length);
        const children = hasChildren
          ? groupChildrenForButtonLayout(node.children, buttonsInline).map((group) => {
              if (group.kind === 'buttons') {
                return (
                  <div className="d-flex flex-wrap gap-2 mb-3" key={group.children.map((child) => child.id).join('-')}>
                    {group.children.map((child) => renderNode(child, node.type, false, true))}
                  </div>
                );
              }
              return renderNode(group.child, node.type, inheritedButtonsInline);
            })
          : null;
        return (
          <div className={`col-12 col-md-${node.width || 6}`} key={node.id}>
            {hasChildren ? (
              children
            ) : (
              <div className="preview-empty-column rounded-3 border border-dashed p-3 text-muted small text-center bg-light">
                Empty column
              </div>
            )}
          </div>
        );
      }

      const children = node.children?.map((child) => renderNode(child, node.type, inheritedButtonsInline));
      if (node.type === 'card') {
        return <div className="card border-0 shadow-sm mb-3" key={node.id}><div className="card-body">{node.label && <h5 className="card-title">{node.label}</h5>}{children}</div></div>;
      }
      if (node.type === 'section') {
        return <section className="mb-4" key={node.id}>{node.label && <h5 className="mb-3">{node.label}</h5>}{children}</section>;
      }
      if (node.type === 'accordion') {
        return <div className="accordion mb-3" key={node.id}><div className="accordion-item"><h2 className="accordion-header"><button className="accordion-button" type="button">{node.label || 'Accordion Section'}</button></h2><div className="accordion-collapse collapse show"><div className="accordion-body">{children}</div></div></div></div>;
      }
      if (node.type === 'tabs') {
        return <div className="mb-3" key={node.id}><ul className="nav nav-tabs"><li className="nav-item"><span className="nav-link active">{node.label || 'Tab Group'}</span></li></ul><div className="border border-top-0 rounded-bottom p-3 bg-white">{children}</div></div>;
      }
      return <div className="border rounded-4 p-3 mb-3 bg-light-subtle" key={node.id}>{node.label && <h6 className="mb-3">{node.label}</h6>}{children}</div>;
    }

    const fieldWrapperClass =
      parentType === 'row'
        ? `col-12 col-md-${node.width || 6}`
        : inlineButton
          ? ''
          : 'mb-3';

    return (
      <div className={fieldWrapperClass} key={node.id}>
        <FieldFactory
          disabled={runtime.disabled}
          error={errors[node.objectKey]?.[0]}
          field={node}
          formData={formData}
          onBlur={() => executeEventScript(node.events?.onBlur, { field: node, value: formData[node.objectKey], formData })}
          onChange={(nextValue) => handleFieldChange(node, nextValue)}
          onClick={() => {
            if (node.type !== 'button') {
              return undefined;
            }
            const action = resolveButtonAction(node);
            if (action === 'submit' || action === 'reset') {
              return undefined;
            }
            return handleButtonClick(node);
          }}
          value={formData[node.objectKey] ?? runtime.defaultValue ?? ''}
        />
      </div>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(layoutChildren, formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    executeEventScript(form.events?.onSubmit, { formData });

    const submitButton = flatFields.find(
      (field) =>
        field.type === 'button' &&
        resolveButtonAction(field) === 'submit' &&
        field.metadata?.apiUrl?.trim(),
    );

    if (submitButton) {
      executeEventScript(submitButton.events?.onClick, { field: submitButton, formData });
      const result = await callButtonApi(submitButton);
      if (result.ok) {
        console.log('Submitted form payload', formData);
      }
      return;
    }

    setShowSuccess(true);
    console.log('Submitted form payload', formData);
  };

  const handleReset = (event) => {
    event.preventDefault();
    const defaults = applyFormulas(flatFields, createInitialData(layoutChildren));
    setFormData(defaults);
    setErrors({});
  };

  return (
    <div className="card border-0 shadow-sm">
      {showSuccess && (
        <div className="submission-modal" role="dialog" aria-modal="true" aria-labelledby="submitSuccessTitle">
          <div className="submission-card">
            <span className="submission-icon">
              <i className="bi bi-check2" />
            </span>
            <h2 className="h5 mb-2" id="submitSuccessTitle">Form submitted successfully</h2>
            <p className="text-muted mb-4">Your response has been captured.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowSuccess(false);
                onSubmitted?.();
              }}
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="card-body p-4 p-lg-5">
        <div className="mb-4">
          <h3 className="mb-1">{form.name}</h3>
          <p className="text-muted mb-0">{form.description}</p>
        </div>
        <form onReset={handleReset} onSubmit={handleSubmit}>
          {layoutChildren.map((node) => renderNode(node))}
        </form>
      </div>
    </div>
  );
}

export default FormPreview;
