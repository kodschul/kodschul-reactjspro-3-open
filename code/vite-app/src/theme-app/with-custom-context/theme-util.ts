type ThemeGlobal = {
  isDark: boolean;
  setDark: (isDark: boolean) => void;
};

const themeGlobalData = {} as ThemeGlobal;

export const theme = themeGlobalData;
export const setDark = (isDark: boolean) => themeGlobalData.setDark(isDark);

export const setGlobalTheme = (isDark, setDark) => {
  themeGlobalData.isDark = isDark;
  themeGlobalData.setDark = setDark;

  console.warn(themeGlobalData);
};
