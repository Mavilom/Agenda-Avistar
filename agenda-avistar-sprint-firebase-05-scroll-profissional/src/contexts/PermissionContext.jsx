import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { userProfile } = useAuth();

  const value = useMemo(() => {
    const isAdmin = userProfile?.perfil === 'admin';
    const isSupervisor = userProfile?.perfil === 'supervisor';
    const isTechnician = userProfile?.perfil === 'tecnico';

    return {
      isAdmin,
      isSupervisor,
      isTechnician,
      canCreateDemand: isAdmin || isSupervisor,
      canEditDemand: isAdmin || isSupervisor || isTechnician,
      canDeleteDemand: isAdmin,
      canManageUsers: isAdmin
    };
  }, [userProfile]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions deve ser usado dentro de PermissionProvider.');
  return context;
}
