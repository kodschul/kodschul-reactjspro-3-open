import React, { useState } from "react";
import SwitchThemeButton from "./SwitchThemeButton";
import CardContent from "./CardContent";
import { setGlobalTheme } from "./theme-util";
// imports CardText and SwitchThemeButton
// uses CardText and SwitchThemeButton in the return statement
// has a useState hook to manage the theme with isDark and setDark
const App = () => {
  const [isDark, setDark] = useState(false);

  setGlobalTheme(isDark, setDark);

  return (
    <div style={{}}>
      <CardContent />
      <SwitchThemeButton />
    </div>
  );
};

const AppContainer = () => {
  return (
    <>
      <App />
      <App />
    </>
  );
};

export default AppContainer;
