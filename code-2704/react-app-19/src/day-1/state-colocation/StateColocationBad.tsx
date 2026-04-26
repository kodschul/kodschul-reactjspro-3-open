import { useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

const PRODUCTS = [
  "Laptop Pro 14",
  "Wireless Mouse",
  "USB-C Hub",
  "Mechanical Keyboard",
  "4K Webcam",
  "Standing Desk",
  "Monitor Arm",
  "Noise-Cancelling Headphones",
];

// Dieser Panel ändert sich nicht beim Tippen — sollte nie re-rendern
function RecommendationPanel() {
  const count = useRef(0);
  count.current++;
  return (
    <Box sx={{ p: 1, border: 1, borderColor: "error.light", borderRadius: 1 }}>
      <Typography variant="caption" color="error">
        Empfehlungen — Re-Render #{count.current} (wird bei jedem Tastendruck
        mitgezogen)
      </Typography>
    </Box>
  );
}

// ❌ query-State sitzt im Parent — jeder Tastendruck rendert RecommendationPanel mit
export function StateColocationBad() {
  const [query, setQuery] = useState("");
  const results = PRODUCTS.filter((p) =>
    p.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <TextField
        size="small"
        label="Produkt suchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <RecommendationPanel />
      <List dense disablePadding>
        {results.map((p) => (
          <ListItem key={p} disablePadding sx={{ px: 1 }}>
            <ListItemText
              primary={p}
              primaryTypographyProps={{ fontSize: "0.83rem" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
