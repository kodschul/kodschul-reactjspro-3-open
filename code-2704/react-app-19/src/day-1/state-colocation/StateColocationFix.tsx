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

// State so nah wie möglich — ProductSearch besitzt seinen eigenen State
function ProductSearch() {
  const [query, setQuery] = useState("");
  const results = PRODUCTS.filter((p) =>
    p.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <TextField
        size="small"
        label="Produkt suchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
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
    </>
  );
}

function RecommendationPanel() {
  const count = useRef(0);
  count.current++;
  return (
    <Box
      sx={{ p: 1, border: 1, borderColor: "success.light", borderRadius: 1 }}
    >
      <Typography variant="caption" color="success.main">
        Empfehlungen — Re-Render #{count.current} (ändert sich nicht beim
        Tippen)
      </Typography>
    </Box>
  );
}

// ✅ Parent hat keinen Query-State — RecommendationPanel ist vollständig isoliert
export function StateColocationFix() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <ProductSearch />
      <RecommendationPanel />
    </Box>
  );
}
