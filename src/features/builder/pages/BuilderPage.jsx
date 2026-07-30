import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Canvas from '@/features/builder/components/Canvas';
import FormToolbar from '@/features/builder/components/FormToolbar';
import JsonImportCard from '@/features/builder/components/JsonImportCard';
import LeftSidebar from '@/features/builder/components/LeftSidebar';
import { useFormBuilder } from '@/shared/hooks/useFormBuilder';
import { useToast } from '@/shared/hooks/useToast';
import { setBuilderReturnProjectId } from '@/shared/utils/builderNavigation';

const AUTO_SAVE_INTERVAL_MS = 10_000;

function BuilderPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const createdNewRef = useRef(false);
  const {
    activeForm,
    forms,
    createForm,
    loadForm,
    beginEditSession,
    applyPreviewDraftToForms,
    getPreviewDraft,
    autoSaveActiveForm,
  } = useFormBuilder();
  const formsRef = useRef(forms);
  const sessionFormIdRef = useRef(null);
  const previewDraftAppliedForRef = useRef(null);
  const autoSaveRef = useRef(autoSaveActiveForm);
  const showToastRef = useRef(showToast);
  formsRef.current = forms;
  autoSaveRef.current = autoSaveActiveForm;
  showToastRef.current = showToast;

  // Create once for /builder/new
  useEffect(() => {
    if (formId !== 'new' || createdNewRef.current) {
      return;
    }
    createdNewRef.current = true;
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setBuilderReturnProjectId(projectId);
    }
    const newId = createForm({
      name: 'Form Name',
      ...(projectId
        ? {
            metadata: {
              category: 'Project',
              tags: ['project-form'],
              projectId,
              savedToProject: false,
              isProjectDraft: true,
            },
          }
        : {}),
    });
    beginEditSession(newId);
    sessionFormIdRef.current = newId;
    navigate(`/builder/${newId}`, { replace: true });
  }, [beginEditSession, createForm, formId, navigate, searchParams]);

  // Load form by id (apply preview draft at most once per return from Preview).
  useEffect(() => {
    if (!formId || formId === 'new') {
      previewDraftAppliedForRef.current = null;
      return;
    }

    const draft = getPreviewDraft();
    if (draft?.id === formId && previewDraftAppliedForRef.current !== formId) {
      applyPreviewDraftToForms();
      previewDraftAppliedForRef.current = formId;
    }

    const match =
      formsRef.current.find((form) => form.id === formId) ||
      (draft?.id === formId ? draft : null);

    if (!match) {
      return;
    }

    if (match.metadata?.projectId) {
      setBuilderReturnProjectId(match.metadata.projectId);
    }
    loadForm(formId);
    if (sessionFormIdRef.current !== formId) {
      beginEditSession(formId);
      sessionFormIdRef.current = formId;
    }
    // Intentionally depend only on formId — context handlers are stable enough for one-shot load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  useEffect(() => {
    const projectId = activeForm?.metadata?.projectId || searchParams.get('projectId');
    if (projectId) {
      setBuilderReturnProjectId(projectId);
    }
  }, [activeForm?.metadata?.projectId, searchParams]);

  useEffect(() => {
    if (!activeForm?.id) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      autoSaveRef.current();
      showToastRef.current('Form auto-saved.', 'info');
    }, AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeForm?.id]);

  if (!activeForm) {
    return (
      <div className="alert alert-light border mb-0">
        Loading form builder…
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <FormToolbar />
      <div className="row g-3 builder-shell">
        <div className="col-12 col-xl-3">
          <LeftSidebar />
        </div>
        <div className="col-12 col-xl-9 d-flex flex-column gap-3">
          <Canvas />
          {!activeForm?.layout?.children?.length && <JsonImportCard />}
        </div>
      </div>
    </div>
  );
}

export default BuilderPage;
