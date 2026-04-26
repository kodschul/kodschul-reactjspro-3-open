import { useEffect, useState } from "react";
import { Box, Chip, Typography } from "@mui/material";

// ✅ Cleanup entfernt Listener beim Unmount — idempotent bei Strict Mode und Hot Reload
export function UseEffectCleanupFix() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    // benannte Funktionen — nur so lässt sich removeEventListener korrekt aufrufen
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="success.main">
        ✅ Cleanup sichert: genau 1 aktiver Listener, egal wie oft gemountet
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
