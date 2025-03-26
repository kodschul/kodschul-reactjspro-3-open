import React, { useState } from "react";
import SwitchThemeButton from "./SwitchThemeButton";
import CardContent from "./CardContent";
// imports CardText and SwitchThemeButton
// uses CardText and SwitchThemeButton in the return statement
// has a useState hook to manage the theme with isDark and setDark
const App = () => {
  const [isDark, setDark] = useState(false);

  return (
    <div style={{}}>
      <CardContent isDark={isDark} />
      <SwitchThemeButton isDark={isDark} setDark={setDark} />
    </div>
  );
};

export default App;
