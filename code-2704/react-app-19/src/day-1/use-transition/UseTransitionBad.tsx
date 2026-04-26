import { useState } from "react";
import { Alert, Box, TextField, Typography } from "@mui/material";

const BASE = [
  "Laptop Pro",
  "Wireless Mouse",
  "USB-C Hub",
  "Keyboard MX",
  "Webcam HD",
  "Standing Desk",
  'Monitor 27"',
  "Headphones ANC",
  "SSD 1TB",
  "LED Lamp",
];
const PRODUCTS = Array.from(
  { length: 5_000 },
  (_, i) => `${BASE[i % BASE.length]} Modell ${Math.floor(i / BASE.length) + 1}`
);

// Künstliche CPU-Last pro Element damit die Blockierung spürbar ist
function slowFilter(q: string) {
  const end = performance.now() + 40;
  while (performance.now() < end) {
    /* burn CPU */
  }
  return PRODUCTS.filter((p) => p.toLowerCase().includes(q.toLowerCase()));
}

// ❌ Synchron — jeder Tastendruck blockiert den Thread bis der Filter fertig ist
export function UseTransitionBad() {
  const [query, setQuery] = useState("");
  const results = slowFilter(query); // blockiert Input im selben Render

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Schnell tippen — der Input verzögert sich, weil der Filter den Thread
        blockiert
      </Alert>
      <TextField
        size="small"
        label="5 000 Produkte filtern (schnell tippen)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Typography variant="caption" color="text.secondary">
        {results.length} Treffer
      </Typography>
    </Box>
  );
}
