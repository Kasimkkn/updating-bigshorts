"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import themesData from "@/theme.json";

const themeNames = Object.keys(themesData.themes) as Array<keyof typeof themesData.themes>;

const ThemeSelector: React.FC = () => {
  const { themeName, themeMode, changeTheme } = useTheme();

  return (
    <div className="rounded-xl text-text-color space-y-6">
      {/* Theme Color Selector */}
      <div className="p-4 bg-secondary-bg-color rounded-xl shadow">
        <div className="mb-4 border-b border-border-color pb-2">
          <p className="font-bold text-2xl">Theme Color</p>
          <p className="text-sm text-muted">Choose your preferred theme</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {themeNames.map((newTheme) => {
            const themeData = themesData.themes[newTheme][themeMode];
            const isActive = themeName === newTheme;

            return (
              <button
                key={newTheme}
                onClick={() => changeTheme(newTheme, themeMode)}
                className={`rounded-xl border-2 transition-all duration-300 p-2 font-semibold text-sm shadow-sm hover:shadow-md ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "border-border-color hover:border-primary"
                }`}
                style={{
                  backgroundColor: isActive ? themeData["--background"] : themeData["--surface"],
                  color: themeData["--on-surface"],
                }}
              >
                <div className="w-full h-5 mb-2 rounded" style={{ backgroundColor: themeData["--primary"] }} />
                {newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Mode Selector */}
      {themeName === "white" && <div className="p-4 bg-secondary-bg-color rounded-xl shadow">
        <div className="mb-4 border-b border-border-color pb-2">
          <p className="font-bold text-2xl">Theme Mode</p>
          <p className="text-sm text-muted">Light or dark</p>
        </div>

        <div className="space-y-4">
          {["light", "dark"].map((mode) => (
            <label
              key={mode}
              className="flex items-center justify-between cursor-pointer hover:bg-hover-bg-color px-4 py-2 rounded-lg transition"
            >
              <span className="capitalize text-base">{mode}</span>
              <div className="relative">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={themeMode === mode}
                  onChange={() => changeTheme(themeName, mode as "light" | "dark")}
                  className="sr-only"
                />
                <div className="w-6 h-6 border-2 border-border-color rounded-full flex items-center justify-center">
                  {themeMode === mode && (
                    <div
                      className="w-3.5 h-3.5 rounded-full transition-all duration-300"
                      style={{
                        background:
                          mode === "light"
                            ? "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)"
                            : "linear-gradient(135deg, #3b82f6, #8b5cf6, #d946ef)",
                      }}
                    />
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>}
    </div>
  );
};

export default ThemeSelector;
