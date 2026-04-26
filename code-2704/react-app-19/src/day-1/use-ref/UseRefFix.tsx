import { useEffect, useRef, useState } from "react";
import { Box, Chip, Slider, Typography } from "@mui/material";

// useRef schreibt keinen State → kein Extra-Render
// Der Wert in ref.current ist nach dem Render immer der Wert des LETZTEN Renders
function usePrev<T>(value: T): T {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }); // kein dep-Array — läuft nach jedem Render, löst aber keinen neuen aus
  return ref.current;
}

// ✅ Delta bleibt stabil bis zur nächsten Änderung — kein Extra-Render, kein Flackern
export function UseRefFix() {
  const [price, setPrice] = useState(100);
  const prev = usePrev(price);
  const delta = price - prev;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="caption" color="success.main">
        ✅ Vorheriger Wert via useRef — Delta bleibt sichtbar bis zum nächsten
        Slide
      </Typography>
      <Slider
        min={50}
        max={500}
        step={10}
        value={price}
        onChange={(_, v) => setPrice(v as number)}
        sx={{ width: 220 }}
      />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`Aktuell: ${price} €`} size="small" />
        <Chip label={`Vorher: ${prev} €`} size="small" variant="outlined" />
        {delta !== 0 && (
          <Chip
            label={`${delta > 0 ? "+" : ""}${delta} €`}
            color={delta > 0 ? "error" : "success"}
            size="small"
          />
        )}
      </Box>
    </Box>
  );
}
