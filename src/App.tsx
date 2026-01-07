import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotesBoard from '@/components/notes/NotesBoard';
import { useNotesStore } from '@/stores/notesStore';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Permissions from '@/pages/Permissions';
import Companies from '@/pages/Companies';
import Contacts from '@/pages/Contacts';
import Clients from '@/pages/Clients';
import Contractors from '@/pages/Contractors';
import Consultants from '@/pages/Consultants';
import Opportunities from '@/pages/Opportunities';
import Projects from '@/pages/Projects';
import Invoices from '@/pages/Invoices';
import Estimates from '@/pages/Estimates';
import Messages from '@/pages/Messages';
import Email from '@/pages/Email';
import KnowledgeBase from '@/pages/KnowledgeBase';
import Activity from '@/pages/Activity';
import Financial from '@/pages/Financial';
import Integrations from '@/pages/Integrations';
import Notes from '@/pages/Notes';
import Calendar from '@/pages/Calendar';
import { estimatingRoutes } from '@/modules/estimating/estimating.routes';
import { estimatingSharedRoutes } from '@/modules/estimating/estimating.sharedRoutes';
import EstimateBuilderAIPage from '@/modules/EstimateBuilderAI/pages/EstimateBuilderAIPage';

function App() {
  useTheme();
  const { isOpen: isNotesOpen } = useNotesStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Public shared routes for work orders and purchase orders */}
        {estimatingSharedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                {isNotesOpen && <NotesBoard />}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/contacts/clients" element={<Clients />} />
                  <Route path="/contacts/contractors" element={<Contractors />} />
                  <Route path="/contacts/consultants" element={<Consultants />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/financial/estimates" element={<Estimates />} />
                  {estimatingRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                  <Route path="/estimate-builder-ai" element={<EstimateBuilderAIPage />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/email" element={<Email />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/permissions" element={<Permissions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
