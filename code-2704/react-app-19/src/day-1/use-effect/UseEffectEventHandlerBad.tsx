import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

// ❌ useEffect als Event-Handler-Ersatz — das "submit flag" Anti-Pattern
// Probleme: 3 Renders pro Klick, kein Zugriff mehr auf den User-Gesture-Kontext
// (d.h. window.open() oder router.push() funktionieren hier ggf. nicht)
export function UseEffectEventHandlerBad() {
  const [doSubmit, setDoSubmit] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!doSubmit) return;
    // Läuft in einem separaten Render-Zyklus, der Click-Event ist längst vorbei
    setMessage(`Abgesendet um ${new Date().toLocaleTimeString()}`);
    setDoSubmit(false); // reset — löst noch einen Render aus
  }, [doSubmit]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="error">
        ❌ Flag-State + useEffect statt direktem Handler — 3 Renders pro Klick
      </Typography>
      <Button size="small" variant="outlined" onClick={() => setDoSubmit(true)}>
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
