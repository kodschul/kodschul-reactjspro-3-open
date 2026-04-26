import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

// ✅ Functional update — React passes the current value as `prev`, no closure needed
export function StaleClosureFix() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCount((prev) => prev + 1); // ← prev is always the current value
    }, 500);
    return () => clearInterval(id);
  }, [running]); // no `count` dep needed — functional update avoids the closure

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        Functional update — prev is always current, counter increments correctly
      </Alert>
      <Typography variant="h4">{count}</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setRunning(true)}
        >
          Start
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setRunning(false)}
        >
          Stop
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setRunning(false);
            setCount(0);
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
