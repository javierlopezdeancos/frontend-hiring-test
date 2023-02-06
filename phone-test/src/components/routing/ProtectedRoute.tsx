import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isAuth } = useAuth();

  if (!isAuth()) {
    return (
      <>
        <Navigate to="/login" />
      </>
    );
  }

  return <>{children}</>;
};
