import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

// ❌ setInterval captures `count` from the render when `running` changed (always 0)
// → the counter gets stuck at 1 because it always does setCount(0 + 1)
export function StaleClosureBad() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCount(count + 1); // ← count is stale (always 0 from first effect run)
    }, 500);
    return () => clearInterval(id);
  }, [running]); // count intentionally missing to show the bug

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        count is stale — interval always sees count = 0, counter stuck at 1
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
