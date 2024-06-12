import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { ThemeConsumer, ThemeProvider } from "./theme";

const withTheme = (Component) => {
  return (props) => {
    return (
      <ThemeConsumer>
        {({ theme, setTheme }) => (
          <Component {...props} theme={theme} setTheme={setTheme} />
        )}
      </ThemeConsumer>
    );
  };
};

function MyAppDummy({ theme, setTheme }) {
  const divRef = useRef(null);

  return (
    <>
      <div ref={divRef} className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <div onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Theme mode is: {theme}
          </div>
          {/* <ListComponent /> */}
        </header>
      </div>
    </>
  );
}

const ThemedApp = withTheme(MyAppDummy);

const AppContainer = () => {
  const [theme, setTheme] = useState("dark");
  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default AppContainer;
