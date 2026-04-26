import { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

function fakeSearch(
  term: string,
  delay: number,
  signal: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(`Treffer für: "${term}"`), delay);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Abgebrochen", "AbortError"));
    });
  });
}

// ✅ AbortController bricht die laufende Anfrage tatsächlich ab — nicht nur ignoriert
// Vorteil gegenüber Ignore-Flag: der Browser schickt ein abort-Signal ans Netzwerk
export function RaceConditionAbortFix() {
  const [result, setResult] = useState("—");
  const controllerRef = useRef<AbortController | null>(null);

  function search(term: string, delay: number) {
    controllerRef.current?.abort(); // vorherige Anfrage canceln
    const controller = new AbortController();
    controllerRef.current = controller;

    fakeSearch(term, delay, controller.signal)
      .then(setResult)
      .catch((e) => {
        if (e.name !== "AbortError") throw e;
        // abgebrochen — kein State-Update, die neue Anfrage läuft bereits
      });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="success.main">
        ✅ AbortController — erst Slow, dann schnell Fast klicken
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => search("Laptop Pro", 2000)}
        >
          Slow (2 s)
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => search("Wireless Mouse", 300)}
        >
          Fast (0.3 s)
        </Button>
      </Box>
      <Typography variant="body2">{result}</Typography>
    </Box>
  );
}
