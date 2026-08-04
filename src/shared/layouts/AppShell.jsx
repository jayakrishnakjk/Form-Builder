import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { useProjects } from '../hooks/useProjects';
import {
  getBuilderReturnProjectId,
  setBuilderReturnProjectId,
} from '../utils/builderNavigation';
import { formService } from '../services/formService';
import { ROUTES } from '../constants/routes';

const navItems = [
  { label: 'Dashboard', icon: 'bi-grid-1x2', to: '/dashboard' },
];

const FALLBACK_PROJECT_ID = 'project_recruitment_portal';

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getProjectById, projects } = useProjects();
  const { activeForm, forms } = useFormBuilder();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const segments = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname],
  );
  const isPreviewRoute = segments[0] === 'preview';
  const isStandalonePreview = isPreviewRoute && searchParams.get('standalone') === '1';
  const isBuilderRoute = segments[0] === 'builder';
  const isProjectDetailsRoute = segments[0] === 'projects' && Boolean(segments[1]);

  const resolveReturnProjectId = () => {
    const formId = isBuilderRoute ? segments[1] : activeForm?.id;
    const form =
      forms.find((item) => item.id === formId) ||
      (activeForm?.id === formId ? activeForm : null) ||
      activeForm;

    return (
      form?.metadata?.projectId ||
      getBuilderReturnProjectId() ||
      projects.find((project) => project.id === FALLBACK_PROJECT_ID)?.id ||
      projects.find((project) => /recruitment/i.test(project.name || ''))?.id ||
      projects[0]?.id ||
      FALLBACK_PROJECT_ID
    );
  };

  useEffect(() => {
    if (!isBuilderRoute) {
      return;
    }
    const projectId =
      activeForm?.metadata?.projectId ||
      forms.find((item) => item.id === segments[1])?.metadata?.projectId ||
      getBuilderReturnProjectId();
    if (projectId) {
      setBuilderReturnProjectId(projectId);
    }
  }, [activeForm, forms, isBuilderRoute, segments]);

  const pageMeta = useMemo(() => {
    if (isProjectDetailsRoute) {
      const project = getProjectById(segments[1]);
      return {
        title: project?.name || 'Project Details',
        breadcrumb: ['Dashboard', project?.name || 'Project Details'],
      };
    }

    if (segments[0] === 'projects') {
      return { title: 'Projects', breadcrumb: ['Dashboard', 'Projects'] };
    }

    if (isBuilderRoute) {
      return { title: 'Create Form', breadcrumb: ['Dashboard', 'Create Form'] };
    }

    if (isPreviewRoute) {
      return { title: 'Preview Mode', breadcrumb: ['Create Form', 'Preview'] };
    }

    if (segments[0] === 'forms') {
      return { title: 'Forms', breadcrumb: ['Dashboard', 'Forms'] };
    }

    if (segments[0] === 'settings') {
      return { title: 'Settings', breadcrumb: ['Dashboard', 'Settings'] };
    }

    return { title: 'Dashboard', breadcrumb: [''] };
  }, [getProjectById, isBuilderRoute, isPreviewRoute, isProjectDetailsRoute, segments]);

  // Hide header back on Preview — only "Back to Builder" there.
  const canGoBack =
    !isPreviewRoute && location.pathname !== '/dashboard' && location.pathname !== '/';

  const goToProjectFromBuilder = () => {
    const projectId = resolveReturnProjectId();
    if (!projectId) {
      navigate(ROUTES.dashboard, { replace: true });
      return;
    }

    const targetExists = getProjectById(projectId) || projects.some((p) => p.id === projectId);
    const safeProjectId = targetExists
      ? projectId
      : getBuilderReturnProjectId() ||
        projects.find((p) => p.id === projectId)?.id ||
        projects[0]?.id;

    if (!safeProjectId) {
      navigate(ROUTES.dashboard, { replace: true });
      return;
    }

    setBuilderReturnProjectId(safeProjectId);
    formService.saveAll(forms);
    navigate(`/projects/${safeProjectId}`, { replace: true });
  };

  const handleBack = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (isBuilderRoute) {
      goToProjectFromBuilder();
      return;
    }

    if (isProjectDetailsRoute) {
      navigate('/dashboard');
      return;
    }

    navigate(-1);
  };

  if (isStandalonePreview) {
    return (
      <div className="standalone-preview-shell">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="app-shell w-100 h-100 d-flex flex-column flex-lg-row">
      <aside className={`app-sidebar ${isDrawerOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">F</span>
          <span>
            <span className="sidebar-brand-title">FormBuilder</span>
            <span className="sidebar-brand-subtitle">Project Console</span>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              key={item.label}
              onClick={() => setIsDrawerOpen(false)}
              to={item.to}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {isDrawerOpen && (
        <button className="sidebar-scrim" onClick={() => setIsDrawerOpen(false)} type="button" aria-label="Close menu" />
      )}

      <div className="app-main">
        <header className="app-header">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <button className="icon-button d-lg-none" onClick={() => setIsDrawerOpen(true)} type="button" aria-label="Open menu">
              <i className="bi bi-list" />
            </button>
            {canGoBack && (
              <button className="icon-button" onClick={handleBack} type="button" aria-label="Go back">
                <i className="bi bi-arrow-left" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="app-header-title">{pageMeta.title}</h1>
              <div className="app-breadcrumb">
                {pageMeta.breadcrumb.map((crumb, index) => (
                  <span key={`${crumb}-${index}`}>
                    {index > 0 && <i className="bi bi-chevron-right" />}
                    {crumb}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-pill">
            <span className="profile-avatar">AD</span>
            <span className="d-none d-sm-inline">Admin</span>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
