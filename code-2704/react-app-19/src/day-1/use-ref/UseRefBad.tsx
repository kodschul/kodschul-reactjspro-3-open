import { useEffect, useState } from "react";
import { Box, Chip, Slider, Typography } from "@mui/material";

// ❌ Vorherigen Wert via useState + useEffect verfolgen
// Problem: setPrev löst einen zweiten Render aus, der das Delta sofort wieder auf 0 setzt
// → der Delta-Chip erscheint kurz, verschwindet dann sofort (oder ist gar nicht sichtbar)
export function UseRefBad() {
  const [price, setPrice] = useState(100);
  const [prev, setPrev] = useState(100);

  useEffect(() => {
    setPrev(price); // triggers render #2 → delta wird sofort 0
  }, [price]);

  const delta = price - prev;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="caption" color="error">
        ❌ Vorheriger Wert via useState — Delta-Chip flackert oder erscheint gar
        nicht
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
