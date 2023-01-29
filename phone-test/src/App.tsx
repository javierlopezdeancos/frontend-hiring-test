import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';
import { LoginPage } from './pages/Login/Login';
import { CallsListPage } from './pages/Calls/CallsList/CallsList';
import { CallDetailsPage } from './pages/Calls/CallDetails/CallDetails';
import { Tractor } from '@aircall/tractor';
import { ProtectedLayout } from './components/routing/ProtectedLayout';
import { darkTheme } from './style/theme/darkTheme';
import { RouterProvider } from 'react-router-dom';
import { GlobalAppStyle } from './style/global';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AuthService } from './services/auth';

import './App.css';

const client = AuthService.getClient();

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider />}>
      <Route path="*" element={<Navigate to="/calls" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/calls" element={<CallsListPage />} />
        <Route path="/calls/:callId" element={<CallDetailsPage />} />
      </Route>
    </Route>
  )
);

function App() {
  return (
    <Tractor injectStyle theme={darkTheme}>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
        <GlobalAppStyle />
      </ApolloProvider>
    </Tractor>
  );
}

export default App;
