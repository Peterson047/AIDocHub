'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // IMPORTANT: This is a simple, hardcoded password for demonstration.
  // In a real-world application, this should be handled securely (e.g., environment variables, backend authentication).
  const ADMIN_PASSWORD = 'admin';

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
