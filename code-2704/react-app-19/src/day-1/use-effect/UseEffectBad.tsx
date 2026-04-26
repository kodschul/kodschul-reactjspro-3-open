import { useState, useEffect } from "react";
import { Alert, Box, Chip, TextField } from "@mui/material";

const USERS = [
  "Anna Müller",
  "Ben Schulz",
  "Clara Koch",
  "David Braun",
  "Eva Wagner",
  "Felix Bauer",
];

// ❌ Derived State via useEffect synchronisieren
// Jede Filteränderung löst einen Extra-Render aus: render → effect → setState → render
export function UseEffectBad() {
  const [filter, setFilter] = useState("");
  const [filtered, setFiltered] = useState(USERS);

  useEffect(() => {
    setFiltered(
      USERS.filter((u) => u.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [filter]); // ← löst nach jedem Render einen weiteren Render aus

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Derived State in useEffect → doppelter Render bei jedem Tastendruck
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
