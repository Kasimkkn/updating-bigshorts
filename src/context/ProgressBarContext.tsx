// context/ProgressBarContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ProgressBarContextType {
  showProgressBar: boolean;
  setShowProgressBar: (show: boolean) => void;
  startProgress: () => void;
  stopProgress: () => void;
  toggleProgressBar: () => void;
}

const ProgressBarContext = createContext<ProgressBarContextType | undefined>(undefined);

export const useProgressBar = () => {
  const context = useContext(ProgressBarContext);
  if (!context) {
    throw new Error("useProgressBar must be used within a ProgressBarProvider");
  }
  return context;
};

interface ProgressBarProviderProps {
  children: ReactNode;
}

export const ProgressBarProvider = ({ children }: ProgressBarProviderProps) => {
  const [showProgressBar, setShowProgressBar] = useState(false);

  const startProgress = () => {
setShowProgressBar(true);
  };

  const stopProgress = () => {
setShowProgressBar(false);
  };

  const toggleProgressBar = () => {
setShowProgressBar(prev => !prev);
  };


  const value = {
    showProgressBar,
    setShowProgressBar,
    startProgress,
    stopProgress,
    toggleProgressBar,
  };

  return (
    <ProgressBarContext.Provider value={value}>
      {children}
    </ProgressBarContext.Provider>
  );
};