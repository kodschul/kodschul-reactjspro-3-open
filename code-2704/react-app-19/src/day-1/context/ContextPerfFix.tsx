import { createContext, useContext, useRef, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";

// ✅ Getrennte Contexts — jeder Consumer rendert nur wenn sein Slice sich ändert
const ThemeCtx = createContext<{ theme: "light" | "dark"; toggle: () => void }>(
  {
    theme: "light",
    toggle: () => {},
  }
);
const CartCtx = createContext<{ count: number }>({ count: 3 });

function CartBadge() {
  const { count } = useContext(CartCtx); // abonniert nur CartCtx
  const renders = useRef(0);
  renders.current++;
  return (
    <Chip label={`🛒 ${count} — Render #${renders.current}`} size="small" />
  );
}

function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeCtx);
  return (
    <Button size="small" variant="outlined" onClick={toggle}>
      Modus: {theme}
    </Button>
  );
}

export function ContextPerfFix() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <CartCtx.Provider value={{ count: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="caption" color="success.main">
            ✅ CartBadge bleibt stabil — Theme-Toggle berührt CartCtx nicht
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <ThemeToggle />
            <CartBadge />
          </Box>
        </Box>
      </CartCtx.Provider>
    </ThemeCtx.Provider>
  );
}
