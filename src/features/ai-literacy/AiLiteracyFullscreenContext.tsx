import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AiLiteracyFullscreenContextType {
  isModuleFullscreen: boolean;
  toggleModuleFullscreen: () => void;
}

const AiLiteracyFullscreenContext = createContext<AiLiteracyFullscreenContextType | undefined>(undefined);

interface AiLiteracyFullscreenProviderProps {
  children: ReactNode;
}

export const AiLiteracyFullscreenProvider: React.FC<AiLiteracyFullscreenProviderProps> = ({ children }) => {
  const [isModuleFullscreen, setIsModuleFullscreen] = useState(false);

  const toggleModuleFullscreen = () => {
    setIsModuleFullscreen((prev) => !prev);
  };

  return (
    <AiLiteracyFullscreenContext.Provider value={{ isModuleFullscreen, toggleModuleFullscreen }}>
      {children}
    </AiLiteracyFullscreenContext.Provider>
  );
};

export const useAiLiteracyFullscreen = () => {
  const context = useContext(AiLiteracyFullscreenContext);
  if (context === undefined) {
    throw new Error('useAiLiteracyFullscreen must be used within an AiLiteracyFullscreenProvider');
  }
  return context;
};
