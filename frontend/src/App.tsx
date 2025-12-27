import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ModulePage } from './pages/ModulePage';
import { ModuleCodePage } from './pages/ModuleCodePage';
import { ProgramPage } from './pages/ProgramPage';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/features/auth/ProtectedRoute';
import './index.css';

// Component to route to correct page based on program code
const ProgramRoute = () => {
  const { programCode } = useParams<{ programCode: string }>();
  
  // Only BHR_MODULCODE should go to ModuleCodePage
  if (programCode === 'BHR_MODULCODE') {
    return <ModuleCodePage />;
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

