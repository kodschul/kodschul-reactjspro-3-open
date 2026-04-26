import { useEffect, useState } from "react";
import { Box, Chip, Typography } from "@mui/material";

// ❌ Kein Cleanup — jeder Mount fügt neue Listener hinzu, ohne alte zu entfernen
// Im Strict Mode (Entwicklung) mountet React jede Komponente zweimal →
// nach dem ersten Mount sind bereits 2 Listener aktiv
export function UseEffectCleanupBad() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
    // kein return () => removeEventListener(...)
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="error">
        ❌ Listener stapeln sich bei jedem Mount — DevTools → Event Listeners prüfen
      </Typography>
      <Chip
        label={online ? "🟢 Online" : "🔴 Offline"}
        color={online ? "success" : "error"}
        size="small"
        sx={{ alignSelf: "flex-start" }}
      />
      <Typography variant="caption" color="text.disabled">
        Netzwerk im DevTools auf "Offline" schalten zum Testen
      </Typography>
    </Box>
  );
}
