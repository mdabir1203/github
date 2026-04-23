import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLocked, hasPinSet } = useSecurity();
  const location = useLocation();

  // If PIN is not set, we allow setup, otherwise check if locked
  if (hasPinSet && isLocked) {
    return <Navigate to="/lock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
