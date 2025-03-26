import React, { createContext, useContext, useState } from "react";
import SwitchThemeButton from "./SwitchThemeButton";
import CardContent from "./CardContent";
import { ThemeContext, useTheme } from "./theme";

const AppWithHook = () => {
  const { isDark, setDark } = useTheme();
  return (
    <div>
      <CardContent />
      <SwitchThemeButton />
    </div>
  );
};

const AppWithConsumer = () => {
  return (
    <ThemeContext.Consumer>
      {({ isDark, setDark }) => (
        <div>
          <CardContent isDark={isDark} />
          <SwitchThemeButton isDark={isDark} setDark={setDark} />
        </div>
      )}
    </ThemeContext.Consumer>
  );
};

const AppContainer = () => {
  const [isDark, setDark] = useState(false);

  return (
    <>
      <ThemeContext.Provider value={{ isDark, setDark }}>
        {/* <AppWithConsumer /> */}
        <AppWithHook />
        {/* <AppWithHook /> */}
      </ThemeContext.Provider>
    </>
  );
};

const TwoApps = () => {
  return (
    <>
      <AppContainer />
      {/* <AppContainer /> */}
    </>
  );
};

export default TwoApps;
