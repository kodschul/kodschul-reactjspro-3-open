import { useRef, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";

// ✅ React 18: both setStates are batched into one render — works in click handlers,
// setTimeout, Promises and native event listeners alike
export function AutoBatchingFix() {
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const renders = useRef(0);
  renders.current++;

  function handleEngage() {
    setLikes((n) => n + 1);  // \
    setShares((n) => n + 1); //  → ein einziger Re-Render
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="caption" color="success.main">
        1 Render pro Klick — Renders gesamt: <strong>{renders.current}</strong>
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
