import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBaseField,
  createEmptyForm,
  createEqualColumns,
  getRemainingRowWidth,
} from '../constants/defaults';
import { SAMPLE_FORMS } from '../schemas/sampleForms';
import { CONTAINER_TYPES } from '../constants/fieldCatalog';
import { formService } from '../services/formService';
import { exportJson, importJson, syncFormFields } from '../utils/formSerializer';
import {
  getBuilderReturnProjectId,
  setBuilderReturnProjectId,
} from '../utils/builderNavigation';
import {
  appendNodeToParent,
  cloneDeep,
  createId,
  duplicateNodeById,
  extractNodeById,
  findNode,
  moveNodeInSiblings,
  removeNodeById,
  updateNodeById,
} from '../utils/tree';

export const FormBuilderContext = createContext(null);

const cloneNodeWithNewIds = (node) => {
  const cloned = cloneDeep(node);
  cloned.id = createId(node.type || 'node');
  cloned.name = `${cloned.name || cloned.type}_${Math.random().toString(36).slice(2, 6)}`;
  cloned.objectKey = `${cloned.objectKey || cloned.type}_${Math.random().toString(36).slice(2, 6)}`;
  if (cloned.children?.length) {
    cloned.children = cloned.children.map((child) => cloneNodeWithNewIds(child));
  }
  return cloned;
};

export function FormBuilderProvider({ children }) {
  const [forms, setForms] = useState(() => formService.loadAll());
  const [activeFormId, setActiveFormId] = useState(() => formService.loadAll()[0]?.id || null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [clipboardField, setClipboardField] = useState(null);
  const [jsonDraft, setJsonDraft] = useState('');
  const editBaselineRef = useRef(null);
  const preserveEditSessionRef = useRef(false);
  const previewDraftRef = useRef(null);

  useEffect(() => {
    formService.saveAll(forms);
    if (!activeFormId && forms[0]?.id) {
      setActiveFormId(forms[0].id);
    }
  }, [forms, activeFormId]);

  const activeForm = useMemo(
    () => forms.find((form) => form.id === activeFormId) || forms[0] || createEmptyForm(),
    [forms, activeFormId],
  );

  const selectedField = useMemo(() => {
    if (!selectedFieldId || !activeForm?.layout?.children) {
      return null;
    }
    return findNode(activeForm.layout.children, selectedFieldId)?.node || null;
  }, [activeForm, selectedFieldId]);

  const selectedContainerId = useMemo(() => {
    if (selectedField && CONTAINER_TYPES.includes(selectedField.type)) {
      return selectedField.id;
    }
    return 'root';
  }, [selectedField]);

  const updateActiveForm = (updater) => {
    setForms((currentForms) =>
      currentForms.map((form) => {
        if (form.id !== activeForm.id) {
          return form;
        }
        const updated = typeof updater === 'function' ? updater(cloneDeep(form)) : updater;
        return syncFormFields(updated);
      }),
    );
  };

  const beginEditSession = (formId) => {
    if (!formId) {
      return;
    }
    // Keep baseline when returning from Preview to the same form.
    if (editBaselineRef.current?.formId === formId) {
      return;
    }
    setForms((current) => {
      const form = current.find((item) => item.id === formId);
      if (form) {
        editBaselineRef.current = { formId, snapshot: cloneDeep(form) };
      }
      return current;
    });
  };

  const commitEditSession = () => {
    setForms((current) => {
      const session = editBaselineRef.current;
      if (session) {
        const form = current.find((item) => item.id === session.formId);
        if (form) {
          editBaselineRef.current = { formId: session.formId, snapshot: cloneDeep(form) };
        }
      }
      return current;
    });
  };

  const preserveEditSession = () => {
    preserveEditSessionRef.current = true;
  };

  /** Capture the live (possibly unsaved) form so Preview shows current canvas work. */
  const capturePreviewDraft = () => {
    previewDraftRef.current = cloneDeep(activeForm);
  };

  const getPreviewDraft = () => previewDraftRef.current;

  const clearPreviewDraft = () => {
    previewDraftRef.current = null;
  };

  /** Put preview draft back into forms so Builder shows unsaved work after Preview. */
  const applyPreviewDraftToForms = () => {
    const draft = previewDraftRef.current;
    if (!draft?.id) {
      return;
    }
    setForms((current) => {
      const exists = current.some((form) => form.id === draft.id);
      if (!exists) {
        return [syncFormFields(cloneDeep(draft)), ...current];
      }
      return current.map((form) =>
        form.id === draft.id ? syncFormFields(cloneDeep(draft)) : form,
      );
    });
    setActiveFormId(draft.id);
  };

  /** Keep unsaved builder work when leaving Preview back to Create Form. */
  const returnToBuilderFromPreview = (formId) => {
    preserveEditSessionRef.current = true;
    applyPreviewDraftToForms();
    const targetId = formId || previewDraftRef.current?.id || activeFormId;
    return targetId;
  };

  const discardEditSession = (force = false) => {
    if (!force && preserveEditSessionRef.current) {
      preserveEditSessionRef.current = false;
      return;
    }

    preserveEditSessionRef.current = false;
    const session = editBaselineRef.current;
    if (!session) {
      return;
    }

    editBaselineRef.current = null;
    setForms((current) =>
      current.map((form) =>
        form.id === session.formId ? syncFormFields(cloneDeep(session.snapshot)) : form,
      ),
    );
  };

  const createForm = (overrides = {}) => {
    const form = syncFormFields(createEmptyForm(overrides));
    setForms((current) => [form, ...current]);
    setActiveFormId(form.id);
    setSelectedFieldId(null);
    return form.id;
  };

  const installSamples = () => {
    const samples = SAMPLE_FORMS;
    setForms(samples);
    setActiveFormId(samples[0]?.id || null);
    setSelectedFieldId(null);
  };

  const loadForm = (id) => {
    setActiveFormId(id);
    setSelectedFieldId(null);
  };

  const updateFormMeta = (patch) => {
    updateActiveForm((form) => ({ ...form, ...patch }));
  };

  const clearForm = () => {
    updateActiveForm((form) =>
      syncFormFields(
        createEmptyForm({
          id: form.id,
          createdAt: form.createdAt,
          status: form.status,
          version: form.version,
          metadata: {
            ...(form.metadata || {}),
          },
        }),
      ),
    );
    setSelectedFieldId(null);
    setClipboardField(null);
    setJsonDraft('');
  };

  const saveVersionSnapshot = (note = 'Snapshot saved') => {
    updateActiveForm((form) => ({
      ...form,
      versionHistory: [
        {
          id: createId('version'),
          note,
          version: form.version,
          updatedAt: new Date().toISOString(),
          snapshot: cloneDeep(form.layout),
        },
        ...(form.versionHistory || []),
      ].slice(0, 20),
    }));
  };

  /** Persist active form immediately (including project association) so it appears after Back. */
  const saveActiveForm = (note = 'Form saved') => {
    const projectId =
      activeForm.metadata?.projectId || getBuilderReturnProjectId() || null;

    if (projectId) {
      setBuilderReturnProjectId(projectId);
    }

    setForms((currentForms) => {
      const nextForms = currentForms.map((form) => {
        if (form.id !== activeForm.id) {
          return form;
        }

        const nextName =
          typeof form.name === 'string' && form.name.trim()
            ? form.name.trim()
            : 'Untitled Form';

        return syncFormFields({
          ...cloneDeep(form),
          name: nextName,
          metadata: {
            ...(form.metadata || {}),
            ...(projectId
              ? {
                  projectId,
                  savedToProject: true,
                  isProjectDraft: false,
                }
              : {
                  savedToProject: true,
                  isProjectDraft: false,
                }),
          },
          versionHistory: [
            {
              id: createId('version'),
              note,
              version: form.version,
              updatedAt: new Date().toISOString(),
              snapshot: cloneDeep(form.layout),
            },
            ...(form.versionHistory || []),
          ].slice(0, 20),
        });
      });

      formService.saveAll(nextForms);

      const saved = nextForms.find((form) => form.id === activeForm.id);
      if (saved) {
        editBaselineRef.current = { formId: saved.id, snapshot: cloneDeep(saved) };
        previewDraftRef.current = cloneDeep(saved);
      }

      return nextForms;
    });
  };

  const createField = (type, parentId = selectedContainerId, options = {}) => {
    const columnCount = Number(options.columnCount) || 0;

    // Only for 2Column / 3Column when dropping into / selecting a Row — add N columns into nested children.
    // All other create paths stay unchanged.
    if (type === 'column' && columnCount > 1) {
      const parent =
        parentId === 'root' ? null : findNode(activeForm.layout.children, parentId)?.node;

      if (parent?.type === 'row') {
        const columns = createEqualColumns(columnCount);
        updateActiveForm((form) => {
          let children = form.layout.children;
          columns.forEach((column) => {
            children = appendNodeToParent(children, parentId, column);
          });
          children = updateNodeById(children, parentId, (node) => ({
            ...node,
            metadata: {
              ...node.metadata,
              columns: (node.children || []).map((child) => child.width || 6),
            },
          }));
          return {
            ...form,
            layout: {
              ...form.layout,
              children,
            },
          };
        });
        setSelectedFieldId(columns[0].id);
        return;
      }
    }

    const field = createBaseField(type);

    // Single Column into a partially filled Row → use leftover grid width so it sits side-by-side.
    if (type === 'column' && columnCount <= 1) {
      const parent =
        parentId === 'root' ? null : findNode(activeForm.layout.children, parentId)?.node;
      if (parent?.type === 'row') {
        const remaining = getRemainingRowWidth(parent.children);
        if (remaining > 0) {
          field.width = remaining;
          field.label = `Column ${(parent.children?.length || 0) + 1}`;
        }
      }
    }

    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: appendNodeToParent(form.layout.children, parentId, field),
      },
    }));
    setSelectedFieldId(field.id);
  };

  const updateField = (fieldId, patch) => {
    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: updateNodeById(form.layout.children, fieldId, (node) => ({
          ...node,
          ...(typeof patch === 'function' ? patch(node) : patch),
        })),
      },
    }));
  };

  const deleteField = (fieldId) => {
    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: removeNodeById(form.layout.children, fieldId),
      },
    }));
    setSelectedFieldId(null);
  };

  const duplicateField = (fieldId) => {
    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: duplicateNodeById(form.layout.children, fieldId, cloneNodeWithNewIds),
      },
    }));
  };

  const moveField = (fieldId, direction) => {
    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: moveNodeInSiblings(form.layout.children, fieldId, direction),
      },
    }));
  };

  const moveFieldToParent = (fieldId, targetParentId = 'root') => {
    if (fieldId === targetParentId) {
      return;
    }

    updateActiveForm((form) => {
      const { tree, removedNode } = extractNodeById(form.layout.children, fieldId);
      if (!removedNode) {
        return form;
      }

      let nodeToAppend = removedNode;
      if (removedNode.type === 'column') {
        const parent =
          targetParentId === 'root' ? null : findNode(tree, targetParentId)?.node;
        if (parent?.type === 'row') {
          const remaining = getRemainingRowWidth(parent.children);
          if (remaining > 0) {
            nodeToAppend = { ...removedNode, width: remaining };
          }
        }
      }

      return {
        ...form,
        layout: {
          ...form.layout,
          children: appendNodeToParent(tree, targetParentId, nodeToAppend),
        },
      };
    });
  };

  const copyField = (fieldId) => {
    const match = findNode(activeForm.layout.children, fieldId);
    if (match?.node) {
      setClipboardField(cloneNodeWithNewIds(match.node));
    }
  };

  const pasteField = (targetParentId = selectedContainerId) => {
    if (!clipboardField) {
      return;
    }
    const pasted = cloneNodeWithNewIds(clipboardField);
    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children: appendNodeToParent(form.layout.children, targetParentId, pasted),
      },
    }));
    setSelectedFieldId(pasted.id);
  };

  const duplicateForm = (formId) => {
    const source = forms.find((item) => item.id === formId);
    if (!source) {
      return;
    }
    const copy = syncFormFields({
      ...cloneDeep(source),
      id: createId('form'),
      name: `${source.name} Copy`,
      status: 'draft',
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setForms((current) => [copy, ...current]);
    setActiveFormId(copy.id);
  };

  const deleteForm = (formId) => {
    if (editBaselineRef.current?.formId === formId) {
      editBaselineRef.current = null;
    }
    setForms((current) => current.filter((form) => form.id !== formId));
    if (activeFormId === formId) {
      setActiveFormId(forms.find((form) => form.id !== formId)?.id || null);
      setSelectedFieldId(null);
    }
  };

  const publishForm = (formId = activeForm.id) => {
    setForms((current) =>
      current.map((form) => {
        if (form.id !== formId) {
          return form;
        }
        return syncFormFields({
          ...form,
          status: 'published',
          version: (form.version || 0) + 1,
          versionHistory: [
            {
              id: createId('version'),
              note: 'Published version',
              version: (form.version || 0) + 1,
              updatedAt: new Date().toISOString(),
              snapshot: cloneDeep(form.layout),
            },
            ...(form.versionHistory || []),
          ].slice(0, 20),
        });
      }),
    );
  };

  const draftForm = (formId = activeForm.id) => {
    setForms((current) =>
      current.map((form) =>
        form.id === formId
          ? syncFormFields({
              ...form,
              status: 'draft',
            })
          : form,
      ),
    );
  };

  const importCurrentFormJson = (jsonText) => {
    const importedForm = importJson(jsonText);
    updateActiveForm({
      ...importedForm,
      id: activeForm.id,
      name: importedForm.name || activeForm.name,
      description:
        importedForm.description !== undefined ? importedForm.description : activeForm.description,
      createdAt: activeForm.createdAt,
      status: activeForm.status,
      version: activeForm.version,
      metadata: {
        ...(activeForm.metadata || {}),
        ...(importedForm.metadata || {}),
      },
      versionHistory: activeForm.versionHistory || [],
    });
    setSelectedFieldId(null);
  };

  const exportCurrentFormJson = (pretty = true) => exportJson(activeForm, pretty);

  const value = {
    forms,
    activeForm,
    activeFormId,
    selectedFieldId,
    selectedField,
    clipboardField,
    jsonDraft,
    setJsonDraft,
    selectedContainerId,
    setSelectedFieldId,
    createForm,
    installSamples,
    loadForm,
    beginEditSession,
    commitEditSession,
    discardEditSession,
    preserveEditSession,
    capturePreviewDraft,
    getPreviewDraft,
    clearPreviewDraft,
    applyPreviewDraftToForms,
    returnToBuilderFromPreview,
    updateFormMeta,
    clearForm,
    saveVersionSnapshot,
    saveActiveForm,
    createField,
    updateField,
    deleteField,
    duplicateField,
    moveField,
    moveFieldToParent,
    copyField,
    pasteField,
    duplicateForm,
    deleteForm,
    publishForm,
    draftForm,
    importCurrentFormJson,
    exportCurrentFormJson,
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
}
