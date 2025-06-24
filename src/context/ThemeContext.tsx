"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import themes from "@/theme.json";
import { getLocalStograge } from "@/hooks/getLocalStograge";
import useLocalStorage from "@/hooks/useLocalStorage";

type ThemeName = keyof typeof themes.themes;
type ThemeMode = "light" | "dark"

interface ThemeContextType { 
    themeName: ThemeName;
    changeTheme: (newTheme: ThemeName, newMode: ThemeMode) => void;
    themeMode: ThemeMode,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>("white");
    const [themeMode, setThemeMode] = useState<ThemeMode>("light");
    const [storedTheme, setStoredTheme] = useLocalStorage<string>('theme', '');
const [storedThemeMode, setStoredThemeMode] = useLocalStorage<string>('themeMode', '');

    useEffect(() => {
        const rawThemeMode = getLocalStograge("themeMode") || "light";
        const rawThemeName = getLocalStograge("theme") || "white";
        const savedMode: ThemeMode = isValidThemeMode(rawThemeMode) ? rawThemeMode : "light";
        const savedTheme: ThemeName = isValidThemeName(rawThemeName) ? rawThemeName : "white";
        setThemeName(savedTheme);
        setThemeMode(savedMode)
        applyTheme(savedTheme, savedMode);
    }, []);

    const isValidThemeMode = (value: string): value is ThemeMode => {
        return value === "light" || value === "dark";
    };
      
      const isValidThemeName = (value: string): value is ThemeName => {
        return ["white", "black", "yellow", "purple"].includes(value);
    };

    const applyTheme = (themeName: ThemeName, themeMode: ThemeMode) => {
        const theme = themes.themes[themeName][themeMode];
        const root = document.documentElement;

        if (theme) {
            Object.keys(theme).forEach((key) => {
                const value = theme[key as keyof typeof theme];
                if (typeof value === "string") {
                    root.style.setProperty(key, value);
                }
            });
        }
    };


    const changeTheme = (newTheme: ThemeName, newMode: ThemeMode) => {
        setThemeName(newTheme);
        setThemeMode(newMode)
        if(newTheme !== 'white'){
            newMode = "light"
        }
        applyTheme(newTheme, newMode);
        localStorage.setItem("theme", newTheme); // Save theme for persistence
        localStorage.setItem("themeMode", newMode); // Save theme for persistence
    };

    return (
        <ThemeContext.Provider value={{ themeName, changeTheme, themeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
