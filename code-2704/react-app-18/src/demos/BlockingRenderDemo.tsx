import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

// Artificial CPU work on every keystroke — blocks the main thread
function filterItems(query: string) {
  const start = performance.now();
  while (performance.now() - start < 30) {
    // busy-wait 30 ms to simulate expensive render
  }
  return Array.from({ length: 10_000 }, (_, i) => `Item ${i + 1}`).filter(
    (item) => item.toLowerCase().includes(query.toLowerCase())
  );
  // .slice(0, 20);
}

export function BlockingRenderDemo() {
  const [query, setQuery] = useState("");
  const results = filterItems(query); // synchronous — no way to interrupt

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="error">
        <AlertTitle>Problem: Synchronous Rendering (pre-React 18)</AlertTitle>
        Every keystroke triggers a 30 ms synchronous CPU block on the main
        thread. Type quickly — the input lags. Animations freeze. React cannot
        interrupt or prioritize anything.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// No way to tell React "this is urgent" vs "this can wait"
const [query, setQuery] = useState("");
const results = filterItems(query); // blocks on EVERY keystroke`}</Typography>
      </Alert>

      <TextField
        label="Search (notice the input lag)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        autoComplete="off"
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {results.length} of 10 000 items
        </Typography>
        <Chip label="main thread blocked" color="error" size="small" />
      </Box>

      <List
        dense
        sx={{
          maxHeight: 200,
          overflow: "auto",
          bgcolor: "action.hover",
          borderRadius: 1,
        }}
      >
        {results.map((item) => (
          <ListItem key={item}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
