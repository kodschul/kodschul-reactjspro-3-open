import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Box, Button, Chip, Typography } from "@mui/material";

// ❌ flushSync forces each setState into its own render — simulates React 17 behaviour
// In the wild this happens with third-party event systems that bypass React's scheduler
export function AutoBatchingBad() {
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const renders = useRef(0);
  renders.current++;

  function handleEngage() {
    flushSync(() => setLikes((n) => n + 1));  // render 1
    flushSync(() => setShares((n) => n + 1)); // render 2
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="error">
        2 separate Renders pro Klick — Renders gesamt: <strong>{renders.current}</strong>
      </Typography>
      <Button size="small" variant="outlined" onClick={handleEngage}>
        Like &amp; Share
      </Button>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Chip label={`👍 ${likes}`} size="small" />
        <Chip label={`🔁 ${shares}`} size="small" />
      </Box>
    </Box>
  );
}
