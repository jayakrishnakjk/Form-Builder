import { FormBuilderProvider } from '@/shared/contexts/FormBuilderContext';
import { ProjectProvider } from '@/shared/contexts/ProjectContext';
import { ToastProvider } from '@/shared/contexts/ToastContext';

export function AppProviders({ children }) {
  return (
    <ProjectProvider>
      <FormBuilderProvider>
        <ToastProvider>{children}</ToastProvider>
      </FormBuilderProvider>
    </ProjectProvider>
  );
}
