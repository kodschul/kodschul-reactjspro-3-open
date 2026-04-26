import { useRef, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

// Simulates an API call that resolves after `delay` ms
function fakeApi(label: string, delay: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(label), delay));
}

// ❌ No protection — a slow request fired first can overwrite a faster newer one
export function RaceConditionBad() {
  const [result, setResult] = useState("—");

  function search(label: string, delay: number) {
    fakeApi(label, delay).then((res) => setResult(res)); // always updates, even if stale
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Click "Slow" then immediately "Fast" — the slow result overwrites the
        fast one
      </Alert>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => search("🐢 slow", 2000)}
        >
          Slow (2 s)
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => search("⚡ fast", 300)}
        >
          Fast (0.3 s)
        </Button>
      </Box>
      <Typography variant="body2">
        Result: <strong>{result}</strong>
      </Typography>
    </Box>
  );
}
