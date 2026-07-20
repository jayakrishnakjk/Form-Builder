import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import BuilderPage from './pages/BuilderPage';
import DashboardPage from './pages/DashboardPage';
import PreviewPage from './pages/PreviewPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProjectDashboardPage />} />
        <Route path="/projects" element={<ProjectDashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/forms" element={<DashboardPage />} />
        <Route path="/builder/:formId" element={<BuilderPage />} />
        <Route path="/preview/:formId" element={<PreviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
