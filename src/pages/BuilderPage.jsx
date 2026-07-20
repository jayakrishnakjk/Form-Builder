import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Canvas from '../components/builder/Canvas';
import FormToolbar from '../components/builder/FormToolbar';
import JsonImportCard from '../components/builder/JsonImportCard';
import LeftSidebar from '../components/builder/LeftSidebar';
import PropertyPanel from '../components/property-panel/PropertyPanel';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { setBuilderReturnProjectId } from '../utils/builderNavigation';

function BuilderPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createdNewRef = useRef(false);
  const {
    activeForm,
    forms,
    createForm,
    loadForm,
    beginEditSession,
    applyPreviewDraftToForms,
    getPreviewDraft,
  } = useFormBuilder();
  const formsRef = useRef(forms);
  const sessionFormIdRef = useRef(null);
  formsRef.current = forms;

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

  // Load form by id
  useEffect(() => {
    if (!formId || formId === 'new') {
      return;
    }

    const draft = getPreviewDraft();
    if (draft?.id === formId) {
      applyPreviewDraftToForms();
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
  }, [applyPreviewDraftToForms, beginEditSession, formId, getPreviewDraft, loadForm]);

  useEffect(() => {
    const projectId = activeForm?.metadata?.projectId || searchParams.get('projectId');
    if (projectId) {
      setBuilderReturnProjectId(projectId);
    }
  }, [activeForm?.metadata?.projectId, searchParams]);

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
          <JsonImportCard />
        </div>
        <div className="col-12 col-xl-3">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

export default BuilderPage;
