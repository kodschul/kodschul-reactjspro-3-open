import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

// ✅ Logik direkt im Handler — 1 Render, voller Zugriff auf den User-Gesture-Kontext
// router.push(), window.open(), analytics.track() funktionieren hier ohne Einschränkungen
export function UseEffectEventHandlerFix() {
  const [message, setMessage] = useState("");

  function handleSubmit() {
    setMessage(`Abgesendet um ${new Date().toLocaleTimeString()}`);
    // router.push("/danke")   ← funktioniert hier, im useEffect oft nicht
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="success.main">
        ✅ Logik im Click-Handler — 1 Render, kein Flag-State nötig
      </Typography>
      <Button size="small" variant="outlined" onClick={handleSubmit}>
        Formular absenden
      </Button>
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
