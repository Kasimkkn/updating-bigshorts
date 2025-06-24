// @/hooks/getLocalStograge.ts (fix the typo too!)
export const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Error accessing localStorage for key "${key}":`, error);
    return null;
  }
};

// Keep the old function for backwards compatibility
export const getLocalStograge = getLocalStorage;