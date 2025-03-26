import { theme, setDark } from "./theme-util";

const SwitchThemeButton = () => {
  return (
    <button onClick={() => setDark(!theme.isDark)}>
      {theme.isDark ? "Switch lights on" : "Switch lights off"}
    </button>
  );
};

export default SwitchThemeButton;
