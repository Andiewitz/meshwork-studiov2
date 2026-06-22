import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type AuthMode = 'login' | 'register';

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  open: (mode?: AuthMode) => void;
  close: () => void;
  switchMode: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');

  const open = useCallback((m: AuthMode = 'login') => {
    setMode(m);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchMode = useCallback((m: AuthMode) => {
    setMode(m);
  }, []);

  // Check URL params on mount for backwards compat (?auth=login or ?auth=register)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    if (authParam === 'login' || authParam === 'register') {
      open(authParam);
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [open]);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, open, close, switchMode }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}
