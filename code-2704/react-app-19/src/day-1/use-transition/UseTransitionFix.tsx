import { useState, useTransition } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

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

function slowFilter(q: string) {
  const end = performance.now() + 40;
  while (performance.now() < end) {
    /* burn CPU */
  }
  return PRODUCTS.filter((p) => p.toLowerCase().includes(q.toLowerCase()));
}

// ✅ startTransition markiert den Filter als nicht dringend — Input bleibt reaktiv
export function UseTransitionFix() {
  const [query, setQuery] = useState(""); // dringend: steuert den Input
  const [deferred, setDeferred] = useState(""); // nicht dringend: führt den Filter
  const [isPending, startTransition] = useTransition();

  const results = slowFilter(deferred);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        Schnell tippen — Input bleibt reaktiv, Spinner zeigt laufenden Filter
      </Alert>
      <TextField
        size="small"
        label="5 000 Produkte filtern (schnell tippen)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          startTransition(() => setDeferred(e.target.value));
        }}
        InputProps={{
          endAdornment: isPending ? <CircularProgress size={16} /> : null,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {results.length} Treffer
      </Typography>
    </Box>
  );
}
