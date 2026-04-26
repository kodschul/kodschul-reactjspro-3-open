import { useRef, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

function fakeApi(label: string, delay: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(label), delay));
}

// ✅ Ignore-flag — only the latest request's result is applied
export function RaceConditionFix() {
  const [result, setResult] = useState("—");
  const latestRef = useRef(0); // incremented on every new request

  function search(label: string, delay: number) {
    const id = ++latestRef.current;
    fakeApi(label, delay).then((res) => {
      if (id === latestRef.current) setResult(res); // ignore if a newer request exists
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        Click "Slow" then "Fast" — only the latest result is shown
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
