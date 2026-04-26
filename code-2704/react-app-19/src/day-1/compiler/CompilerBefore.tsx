import { useCallback, useMemo, useState } from "react";
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

type Status = "all" | "pending" | "shipped" | "done";

const ORDERS = [
  { id: 1, customer: "Anna M.", amount: 129, status: "pending" as const },
  { id: 2, customer: "Ben S.", amount: 549, status: "shipped" as const },
  { id: 3, customer: "Clara K.", amount: 89, status: "done" as const },
  { id: 4, customer: "David B.", amount: 349, status: "pending" as const },
];

// ❌ Manuelle Memoization — notwendig vor dem React Compiler
// useMemo + useCallback: korrekt, aber Boilerplate der vom Compiler übernommen wird
export function CompilerBefore() {
  const [filter, setFilter] = useState<Status>("all");

  const filtered = useMemo(
    () => (filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter)),
    [filter]
  );

  const chipColor = useCallback((s: string): "warning" | "info" | "success" => {
    if (s === "done") return "success";
    if (s === "shipped") return "info";
    return "warning";
  }, []); // leeres dep-Array — diese Funktion ändert sich nie, aber das muss man manuell sicherstellen

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        useMemo + useCallback — funktioniert, aber jede Dep-Array-Lücke ist ein Bug
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
