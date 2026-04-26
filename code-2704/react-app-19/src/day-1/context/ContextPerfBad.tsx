import { createContext, useContext, useRef, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";

// ❌ Ein großer Context — Theme-Änderung re-rendert alle Consumer, auch CartBadge
type AppState = { theme: "light" | "dark"; cartCount: number };
type AppCtxType = AppState & { toggleTheme: () => void };

const AppCtx = createContext<AppCtxType>({
  theme: "light",
  cartCount: 3,
  toggleTheme: () => {},
});

function CartBadge() {
  const { cartCount } = useContext(AppCtx); // abonniert den ganzen Context
  const renders = useRef(0);
  renders.current++;
  return (
    <Chip label={`🛒 ${cartCount} — Render #${renders.current}`} size="small" />
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(AppCtx);
  return (
    <Button size="small" variant="outlined" onClick={toggleTheme}>
      Modus: {theme}
    </Button>
  );
}

export function ContextPerfBad() {
  const [state, setState] = useState<AppState>({
    theme: "light",
    cartCount: 3,
  });
  const toggleTheme = () =>
    setState((s) => ({ ...s, theme: s.theme === "light" ? "dark" : "light" }));

  return (
    <AppCtx.Provider value={{ ...state, toggleTheme }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="caption" color="error">
          ❌ CartBadge re-rendert bei jedem Theme-Toggle — cartCount hat sich
          nicht verändert
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <ThemeToggle />
          <CartBadge />
        </Box>
      </Box>
    </AppCtx.Provider>
  );
}
