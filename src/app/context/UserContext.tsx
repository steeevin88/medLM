"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define user types
export type UserRole = 'doctor' | 'patient' | null;

// Define user context interface
interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  userRole: null,
  setUserRole: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

// Create provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <UserContext.Provider 
      value={{ 
        userRole, 
        setUserRole, 
        isAuthenticated, 
        setIsAuthenticated 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Create hook for easy context use
export function useUser() {
  return useContext(UserContext);
} 