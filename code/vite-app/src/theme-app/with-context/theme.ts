import { createContext, useContext } from "react";

type ThemeState = {
  isDark: boolean;
  setDark: (isDark: boolean) => void;
};

export const ThemeContext = createContext<ThemeState>({
  isDark: true,
  setDark: () => {},
});

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => useContext(ThemeContext);
