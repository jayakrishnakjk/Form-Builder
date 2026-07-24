import { Navigate, Route, Routes } from 'react-router-dom';
import BuilderPage from '@/features/builder/pages/BuilderPage';
import DashboardPage from '@/features/forms/pages/DashboardPage';
import PreviewPage from '@/features/preview/pages/PreviewPage';
import ProjectDashboardPage from '@/features/projects/pages/ProjectDashboardPage';
import ProjectDetailsPage from '@/features/projects/pages/ProjectDetailsPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import { ROUTES } from '@/shared/constants/routes';
import AppShell from '@/shared/layouts/AppShell';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={ROUTES.home} element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.dashboard} element={<ProjectDashboardPage />} />
        <Route path={ROUTES.projects} element={<ProjectDashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path={ROUTES.forms} element={<DashboardPage />} />
        <Route path="/builder/:formId" element={<BuilderPage />} />
        <Route path="/preview/:formId" element={<PreviewPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
