import { useEffect, useState } from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";

// ❌ Identical resize logic copy-pasted into two components
// Any bug or change must be fixed in both places

function ComponentA() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return <Chip label={`A: ${width}px`} size="small" />;
}

function ComponentB() {
  const [width, setWidth] = useState(window.innerWidth); // copy-paste ❌
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return <Chip label={`B: ${width}px`} size="small" />;
}

export function CustomHooksBad() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Resize logic duplicated in both components — resize the window to see it
        work
      </Alert>
      <Typography variant="caption" color="text.secondary">
        Resize the browser window
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <ComponentA />
        <ComponentB />
      </Box>
    </Box>
  );
}
