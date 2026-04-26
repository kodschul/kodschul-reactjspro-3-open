import { useEffect, useState } from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";

// ✅ Logic extracted once — both components share the same hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function ComponentA() {
  const width = useWindowWidth();
  return <Chip label={`A: ${width}px`} size="small" />;
}

function ComponentB() {
  const width = useWindowWidth(); // same hook, zero duplication ✅
  return <Chip label={`B: ${width}px`} size="small" />;
}

export function CustomHooksFix() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        useWindowWidth shared by both — logic lives in one place
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
