import { useState } from "react";
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

type Status = "all" | "pending" | "shipped" | "done";

const ORDERS = [
  { id: 1, customer: "Anna M.", amount: 129, status: "pending" as const },
  { id: 2, customer: "Ben S.", amount: 549, status: "shipped" as const },
  { id: 3, customer: "Clara K.", amount: 89, status: "done" as const },
  { id: 4, customer: "David B.", amount: 349, status: "pending" as const },
];

// Module-level helper — der Compiler erkennt sie als stabil, kein useCallback nötig
function chipColor(s: string): "warning" | "info" | "success" {
  if (s === "done") return "success";
  if (s === "shipped") return "info";
  return "warning";
}

// ✅ React Compiler memoized automatisch — gleiche Laufzeit, weniger Code, keine Dep-Arrays
export function CompilerAfter() {
  const [filter, setFilter] = useState<Status>("all");

  // Kein useMemo — der Compiler erkennt, dass filtered nur bei filter-Änderung neu berechnet wird
  const filtered = filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        Kein useMemo, kein useCallback — der Compiler optimiert, der Code bleibt lesbar
      </Typography>
      <ToggleButtonGroup
        size="small"
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v as Status)}
      >
        {(["all", "pending", "shipped", "done"] as Status[]).map((s) => (
          <ToggleButton key={s} value={s} sx={{ fontSize: "0.7rem" }}>
            {s}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Stack spacing={0.5}>
        {filtered.map((o) => (
          <Box key={o.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2">{o.customer} — {o.amount} €</Typography>
            <Chip label={o.status} color={chipColor(o.status)} size="small" />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
