import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ModulePage } from './pages/ModulePage';
import { ModuleCodePage } from './pages/ModuleCodePage';
import { ProgramCodePage } from './pages/ProgramCodePage';
import { MenuHeaderPage } from './pages/MenuHeaderPage';
import { ProgramPage } from './pages/ProgramPage';
import { UserAccessPage } from './pages/UserAccessPage';
import { StatementPage } from './pages/StatementPage';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/features/auth/ProtectedRoute';
import './index.css';

// Component to route to correct page based on program code
const ProgramRoute = () => {
  const { programCode } = useParams<{ programCode: string }>();
  
  // Route to specific program pages
  if (programCode === 'BHR_MODULCODE') {
    return <ModuleCodePage />;
  }
  
  // KAWALAN PENCAPAIAN MODUL program - handle both possible codes
  if (programCode === 'ADM_ACCESCODE' || programCode === 'BHR_ACCESSMDL') {
    return <UserAccessPage />;
  }
  
  // PENYELENGGARAAN ATURCARA program
  if (programCode === 'BHR_PGRAMCODE') {
    return <ProgramCodePage />;
  }
  
  // KOD TAJUK MENU program
  if (programCode === 'BHR_MENHEADER') {
    return <MenuHeaderPage />;
  }
  
  // PENYATA CUKAI TAKSIRAN program
  if (programCode === 'TKN_STATEMENT') {
    return <StatementPage />;
  }
  
  // All other programs go to ProgramPage
  return <ProgramPage />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="module/:moduleCode" element={<ModulePage />} />
            <Route 
              path="module/:moduleCode/:programCode" 
              element={
                <ProgramRoute />
              } 
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

