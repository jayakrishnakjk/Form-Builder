import { useEffect, useMemo, useRef, useState } from 'react';
import { FormBuilderContext } from './formBuilderContextValue';
import {
  createBaseField,
  createEmptyForm,
  createEqualColumns,
  getRemainingRowWidth,
} from '../constants/defaults';
import { CONTAINER_TYPES } from '../constants/fieldCatalog';
import { formService } from '../services/formService';
import { masterFormService } from '../services/masterFormService';
import { exportJson, importJson, syncFormFields } from '../utils/formSerializer';
import {
  createMasterFormRefNode,
  getMasterFormById,
  isMasterFormRef,
} from '../utils/masterFormUtils';
import {
  clearBuilderReturnProjectId,
  getBuilderReturnProjectId,
  setBuilderReturnProjectId,
} from '../utils/builderNavigation';
import { deleteFormSubmissions } from '../utils/formSubmissionStorage';
import {
  appendNodeToParent,
  cloneDeep,
  createId,
  duplicateNodeById,
  extractNodeById,
  findNode,
  insertNodeToParentAtIndex,
  moveNodeInSiblings,
  removeNodeById,
  updateNodeById,
} from '../utils/tree';

const updateMasterRefNames = (nodes = [], masterFormId, name) =>
  nodes.map((node) => {
    if (isMasterFormRef(node) && node.metadata?.masterFormId === masterFormId) {
      return {
        ...node,
        label: name,
        metadata: {
          ...node.metadata,
          masterFormName: name,
        },
      };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateMasterRefNames(node.children, masterFormId, name),
      };
    }
    return node;
  });

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
  const [forms, setForms] = useState([]);
  const [masterForms, setMasterForms] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingMasterFormId, setEditingMasterFormId] = useState(null);
  const [activeFormId, setActiveFormId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [clipboardField, setClipboardField] = useState(null);
  const [jsonDraft, setJsonDraft] = useState('');
  const editBaselineRef = useRef(null);
  const preserveEditSessionRef = useRef(false);
  const previewDraftRef = useRef(null);
  const masterEditHostFormRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([formService.loadAll(), masterFormService.loadAll()]).then(
      ([loadedForms, loadedMasterForms]) => {
        if (cancelled) {
          return;
        }
        setForms(loadedForms);
        setMasterForms(loadedMasterForms);
        setActiveFormId((current) => current || loadedForms[0]?.id || null);
        setIsLoaded(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Don't persist until the initial load finishes, otherwise the empty
    // initial state would wipe the remote data.
    if (!isLoaded) {
      return;
    }
    formService.saveAll(forms);
    if (!activeFormId && forms[0]?.id) {
      setActiveFormId(forms[0].id);
    }
  }, [forms, activeFormId, isLoaded]);

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
      return false;
    }
    previewDraftRef.current = null;
    const nextDraft = syncFormFields(cloneDeep(draft));
    setForms((current) => {
      const exists = current.some((form) => form.id === nextDraft.id);
      if (!exists) {
        return [nextDraft, ...current];
      }
      return current.map((form) => (form.id === nextDraft.id ? nextDraft : form));
    });
    setActiveFormId(nextDraft.id);
    return true;
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

  const loadForm = (id) => {
    setActiveFormId((current) => (current === id ? current : id));
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

  const clearCanvas = () => {
    if (editingMasterFormId) {
      setEditingMasterFormId(null);
      restoreMasterEditHostForm();
      setSelectedFieldId(null);
      return;
    }

    updateActiveForm((form) =>
      syncFormFields({
        ...form,
        name: 'Form Name',
        description: 'Form Description',
        layout: {
          ...form.layout,
          children: [],
        },
      }),
    );
    setSelectedFieldId(null);
    setEditingMasterFormId(null);
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

  const restoreMasterEditHostForm = () => {
    const host = masterEditHostFormRef.current;
    if (!host?.id) {
      return;
    }

    setForms((current) =>
      current.map((form) => (form.id === host.id ? syncFormFields(cloneDeep(host)) : form)),
    );
    masterEditHostFormRef.current = null;
  };

  const updateEditingMasterForm = (name, { finalize = false } = {}) => {
    if (!editingMasterFormId) {
      return { ok: false, message: 'Not editing a master form.' };
    }

    const trimmed = name?.trim();
    if (!trimmed) {
      return { ok: false, message: 'Form name is required.' };
    }

    const children = activeForm.layout?.children || [];
    if (!children.length) {
      return { ok: false, message: 'Add at least one field to the canvas before saving.' };
    }

    setMasterForms((current) => {
      const next = current.map((item) =>
        item.id === editingMasterFormId
          ? {
              ...item,
              name: trimmed,
              children: cloneDeep(children),
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
      masterFormService.saveAll(next);
      return next;
    });
    setForms((current) =>
      current.map((form) =>
        syncFormFields({
          ...form,
          layout: {
            ...form.layout,
            children: updateMasterRefNames(form.layout.children, editingMasterFormId, trimmed),
          },
        }),
      ),
    );

    if (finalize) {
      setEditingMasterFormId(null);
      restoreMasterEditHostForm();
    }

    return { ok: true, updated: true };
  };

  /** Persist active form immediately (including project association) so it appears after Back. */
  const persistActiveForm = (note = 'Form saved', { trackVersion = true } = {}) => {
    if (editingMasterFormId) {
      const children = activeForm.layout?.children || [];
      const name = activeForm.name?.trim();
      if (name && children.length) {
        updateEditingMasterForm(name, { finalize: false });
      }
      return;
    }

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
          versionHistory: trackVersion
            ? [
                {
                  id: createId('version'),
                  note,
                  version: form.version,
                  updatedAt: new Date().toISOString(),
                  snapshot: cloneDeep(form.layout),
                },
                ...(form.versionHistory || []),
              ].slice(0, 20)
            : form.versionHistory || [],
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

  const saveActiveForm = (note = 'Form saved') => persistActiveForm(note, { trackVersion: true });

  const autoSaveActiveForm = () => persistActiveForm('Auto-saved', { trackVersion: false });

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
              columns: columns.map((column) => column.width || 6),
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

    if (type === 'heading' && options.headingLevel) {
      const level = options.headingLevel;
      field.metadata.level = level;
      field.label = level.toUpperCase();
      field.defaultValue = `${level.toUpperCase()} Heading`;
    }

    // Single Column into a partially filled Row → use leftover grid width so it sits side-by-side.
    if (type === 'column' && columnCount <= 1) {
      const parent =
        parentId === 'root' ? null : findNode(activeForm.layout.children, parentId)?.node;
      if (parent?.type === 'row') {
        const slotWidth = Number(options.columnWidth);
        const remaining = getRemainingRowWidth(parent.children);
        if (slotWidth > 0) {
          field.width = slotWidth;
          field.label = `Column ${(Number(options.insertAtIndex) || parent.children?.length || 0) + 1}`;
        } else if (remaining > 0) {
          field.width = remaining;
          field.label = `Column ${(parent.children?.length || 0) + 1}`;
        }
      }
    }

    const insertAtIndex =
      options.insertAtIndex === undefined || options.insertAtIndex === null
        ? null
        : Number(options.insertAtIndex);

    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children:
          insertAtIndex !== null && !Number.isNaN(insertAtIndex) && parentId !== 'root'
            ? insertNodeToParentAtIndex(form.layout.children, parentId, field, insertAtIndex)
            : appendNodeToParent(form.layout.children, parentId, field),
      },
    }));
    setSelectedFieldId(field.id);
  };

  const saveMasterForm = (name, { finalize = true } = {}) => {
    const trimmed = name?.trim();
    if (!trimmed) {
      return { ok: false, message: 'Form name is required.' };
    }

    const children = activeForm.layout?.children || [];
    if (!children.length) {
      return { ok: false, message: 'Add at least one field to the canvas before saving.' };
    }

    const projectId = activeForm.metadata?.projectId || getBuilderReturnProjectId() || null;

    if (editingMasterFormId) {
      return updateEditingMasterForm(trimmed, { finalize });
    }

    const entry = {
      id: `master_${crypto.randomUUID()}`,
      name: trimmed,
      projectId,
      children: cloneDeep(children),
      createdAt: new Date().toISOString(),
    };

    setMasterForms((current) => {
      const next = [...current, entry];
      masterFormService.saveAll(next);
      return next;
    });

    return { ok: true, updated: false };
  };

  const loadMasterFormForEdit = (masterFormId) => {
    const master = getMasterFormById(masterForms, masterFormId);
    if (!master) {
      return { ok: false, message: 'Master form not found.' };
    }

    if (!editingMasterFormId) {
      masterEditHostFormRef.current = cloneDeep(activeForm);
    }

    setEditingMasterFormId(masterFormId);
    updateActiveForm((form) =>
      syncFormFields({
        ...form,
        name: master.name,
        layout: {
          ...form.layout,
          children: cloneDeep(master.children),
        },
      }),
    );
    setSelectedFieldId(null);
    return { ok: true };
  };

  const deleteMasterForm = (masterFormId) => {
    let deletedName = '';
    setMasterForms((current) => {
      const target = current.find((item) => item.id === masterFormId);
      deletedName = target?.name || '';
      const next = current.filter((item) => item.id !== masterFormId);
      masterFormService.saveAll(next);
      return next;
    });
    return deletedName;
  };

  const insertMasterForm = (masterFormId, parentId = selectedContainerId, options = {}) => {
    const master = masterForms.find((item) => item.id === masterFormId);
    if (!master) {
      return;
    }

    const refNode = createMasterFormRefNode(master);
    const insertAtIndex =
      options.insertAtIndex === undefined || options.insertAtIndex === null
        ? null
        : Number(options.insertAtIndex);

    updateActiveForm((form) => ({
      ...form,
      layout: {
        ...form.layout,
        children:
          insertAtIndex !== null && !Number.isNaN(insertAtIndex) && parentId !== 'root'
            ? insertNodeToParentAtIndex(form.layout.children, parentId, refNode, insertAtIndex)
            : appendNodeToParent(form.layout.children, parentId, refNode),
      },
    }));

    setSelectedFieldId(refNode.id);
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

  const updateMasterFormField = (masterFormId, fieldId, patch) => {
    setMasterForms((current) => {
      const next = current.map((master) => {
        if (master.id !== masterFormId) {
          return master;
        }
        return {
          ...master,
          children: updateNodeById(master.children, fieldId, (node) => ({
            ...node,
            ...(typeof patch === 'function' ? patch(node) : patch),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      masterFormService.saveAll(next);
      return next;
    });
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

  const moveFieldToParent = (fieldId, targetParentId = 'root', options = {}) => {
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
          const slotWidth = Number(options.columnWidth);
          const remaining = getRemainingRowWidth(parent.children);
          if (slotWidth > 0) {
            nodeToAppend = { ...removedNode, width: slotWidth };
          } else if (remaining > 0) {
            nodeToAppend = { ...removedNode, width: remaining };
          }
        }
      }

      const insertAtIndex =
        options.insertAtIndex === undefined || options.insertAtIndex === null
          ? null
          : Number(options.insertAtIndex);

      const children =
        insertAtIndex !== null && !Number.isNaN(insertAtIndex) && targetParentId !== 'root'
          ? insertNodeToParentAtIndex(tree, targetParentId, nodeToAppend, insertAtIndex)
          : appendNodeToParent(tree, targetParentId, nodeToAppend);

      return {
        ...form,
        layout: {
          ...form.layout,
          children,
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
    setForms((current) => {
      const next = current.filter((form) => form.id !== formId);
      if (activeFormId === formId) {
        setActiveFormId(next[0]?.id ?? null);
        setSelectedFieldId(null);
      }
      return next;
    });
    deleteFormSubmissions([formId]);
  };

  const deleteProjectRelatedData = (projectId) => {
    if (!projectId) {
      return;
    }

    if (getBuilderReturnProjectId() === projectId) {
      clearBuilderReturnProjectId();
    }

    setMasterForms((current) => {
      const removedMasterIds = new Set(
        current.filter((item) => item.projectId === projectId).map((item) => item.id),
      );
      if (editingMasterFormId && removedMasterIds.has(editingMasterFormId)) {
        setEditingMasterFormId(null);
      }
      const next = current.filter((item) => item.projectId !== projectId);
      masterFormService.saveAll(next);
      return next;
    });

    setForms((current) => {
      const removedForms = current.filter((form) => form.metadata?.projectId === projectId);
      const removedFormIds = removedForms.map((form) => form.id);
      deleteFormSubmissions(removedFormIds);

      removedForms.forEach((form) => {
        if (editBaselineRef.current?.formId === form.id) {
          editBaselineRef.current = null;
        }
      });

      const next = current.filter((form) => form.metadata?.projectId !== projectId);
      if (activeFormId && removedFormIds.includes(activeFormId)) {
        setActiveFormId(next[0]?.id ?? null);
        setSelectedFieldId(null);
        setEditingMasterFormId(null);
      }
      return next;
    });
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
    masterForms,
    isLoaded,
    editingMasterFormId,
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
    clearCanvas,
    saveVersionSnapshot,
    saveActiveForm,
    autoSaveActiveForm,
    createField,
    saveMasterForm,
    loadMasterFormForEdit,
    deleteMasterForm,
    insertMasterForm,
    updateField,
    updateMasterFormField,
    deleteField,
    duplicateField,
    moveField,
    moveFieldToParent,
    copyField,
    pasteField,
    duplicateForm,
    deleteForm,
    deleteProjectRelatedData,
    publishForm,
    draftForm,
    importCurrentFormJson,
    exportCurrentFormJson,
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
}
