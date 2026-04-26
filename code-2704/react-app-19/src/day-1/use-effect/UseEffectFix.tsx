import { useState } from "react";
import { Alert, Box, Chip, TextField } from "@mui/material";

const USERS = [
  "Anna Müller",
  "Ben Schulz",
  "Clara Koch",
  "David Braun",
  "Eva Wagner",
  "Felix Bauer",
];

// ✅ Derived State direkt im Render berechnen — kein useEffect, kein Extra-Render
export function UseEffectFix() {
  const [filter, setFilter] = useState("");

  // Ein einziger Render-Durchlauf — React berechnet das Ergebnis inline
  const filtered = USERS.filter((u) =>
    u.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        Direkt im Render berechnet — kein useEffect, kein Extra-Render-Zyklus
      </Alert>
      <TextField
        size="small"
        label="Nutzer filtern"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {filtered.map((u) => (
          <Chip key={u} label={u} size="small" />
        ))}
      </Box>
    </Box>
  );
}
