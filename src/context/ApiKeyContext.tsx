import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    // Load API key from session storage on initial load
    const storedKey = sessionStorage.getItem('openrouter_api_key');
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    sessionStorage.setItem('openrouter_api_key', key);
    setApiKeyState(key);
  };

  const clearApiKey = () => {
    sessionStorage.removeItem('openrouter_api_key');
    setApiKeyState(null);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
