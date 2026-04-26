import { Fragment, useState } from "react";
import type { ComponentType } from "react";
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from "@mui/material";
import { AutoBatchingBad } from "./auto-batching/AutoBatchingBad";
import { AutoBatchingFix } from "./auto-batching/AutoBatchingFix";
import { CompilerBefore } from "./compiler/CompilerBefore";
import { CompilerAfter } from "./compiler/CompilerAfter";
import { UseTransitionBad } from "./use-transition/UseTransitionBad";
import { UseTransitionFix } from "./use-transition/UseTransitionFix";
import { UseEffectBad } from "./use-effect/UseEffectBad";
import { UseEffectFix } from "./use-effect/UseEffectFix";
import { UseEffectEventHandlerBad } from "./use-effect/UseEffectEventHandlerBad";
import { UseEffectEventHandlerFix } from "./use-effect/UseEffectEventHandlerFix";
import { UseEffectCleanupBad } from "./use-effect/UseEffectCleanupBad";
import { UseEffectCleanupFix } from "./use-effect/UseEffectCleanupFix";
import { RaceConditionBad } from "./race-condition/RaceConditionBad";
import { RaceConditionAbortFix } from "./race-condition/RaceConditionAbortFix";
import { StaleClosureBad } from "./stale-closure/StaleClosureBad";
import { StaleClosureFix } from "./stale-closure/StaleClosureFix";
import { UseRefBad } from "./use-ref/UseRefBad";
import { UseRefFix } from "./use-ref/UseRefFix";
import { StateColocationBad } from "./state-colocation/StateColocationBad";
import { StateColocationFix } from "./state-colocation/StateColocationFix";
import { CustomHooksBad } from "./custom-hooks/CustomHooksBad";
import { CustomHooksFix } from "./custom-hooks/CustomHooksFix";
import { CompositionBad } from "./composition/CompositionBad";
import { CompositionFix } from "./composition/CompositionFix";
import { ContextPerfBad } from "./context/ContextPerfBad";
import { ContextPerfFix } from "./context/ContextPerfFix";

interface Topic {
  id: string;
  label: string;
  module: string;
  Bad: ComponentType;
  Fix: ComponentType;
  badLabel?: string;
  fixLabel?: string;
}

const TOPICS: Topic[] = [
  // ─── Modul 1 ───────────────────────────────────────────────────────────────
  {
    id: "use-transition",
    label: "Concurrent Rendering",
    module: "Modul 1 — React 18/19",
    Bad: UseTransitionBad,
    Fix: UseTransitionFix,
  },
  {
    id: "auto-batching",
    label: "Automatic Batching",
    module: "Modul 1 — React 18/19",
    Bad: AutoBatchingBad,
    Fix: AutoBatchingFix,
  },
  {
    id: "compiler",
    label: "React Compiler",
    module: "Modul 1 — React 18/19",
    Bad: CompilerBefore,
    Fix: CompilerAfter,
    badLabel: "Vor dem Compiler",
    fixLabel: "Mit React Compiler",
  },
  // ─── Modul 2 ───────────────────────────────────────────────────────────────
  {
    id: "ue-derived",
    label: "Derived State",
    module: "Modul 2 — Hooks",
    Bad: UseEffectBad,
    Fix: UseEffectFix,
  },
  {
    id: "ue-event",
    label: "Event Handler",
    module: "Modul 2 — Hooks",
    Bad: UseEffectEventHandlerBad,
    Fix: UseEffectEventHandlerFix,
  },
  {
    id: "ue-cleanup",
    label: "Cleanup Pattern",
    module: "Modul 2 — Hooks",
    Bad: UseEffectCleanupBad,
    Fix: UseEffectCleanupFix,
  },
  {
    id: "race-condition",
    label: "Race Condition",
    module: "Modul 2 — Hooks",
    Bad: RaceConditionBad,
    Fix: RaceConditionAbortFix,
    fixLabel: "AbortController",
  },
  {
    id: "stale-closure",
    label: "Stale Closures",
    module: "Modul 2 — Hooks",
    Bad: StaleClosureBad,
    Fix: StaleClosureFix,
  },
  {
    id: "use-ref",
    label: "useRef: Prev Value",
    module: "Modul 2 — Hooks",
    Bad: UseRefBad,
    Fix: UseRefFix,
  },
  // ─── Modul 3 ───────────────────────────────────────────────────────────────
  {
    id: "state-coloc",
    label: "State Colocation",
    module: "Modul 3 — Architektur",
    Bad: StateColocationBad,
    Fix: StateColocationFix,
  },
  {
    id: "custom-hooks",
    label: "Custom Hooks",
    module: "Modul 3 — Architektur",
    Bad: CustomHooksBad,
    Fix: CustomHooksFix,
  },
  {
    id: "composition",
    label: "Composition",
    module: "Modul 3 — Architektur",
    Bad: CompositionBad,
    Fix: CompositionFix,
  },
  {
    id: "context-perf",
    label: "Context Performance",
    module: "Modul 3 — Architektur",
    Bad: ContextPerfBad,
    Fix: ContextPerfFix,
  },
];

const MODULES = Array.from(new Set(TOPICS.map((t) => t.module)));

export function Day1() {
  const [activeId, setActiveId] = useState(TOPICS[0].id);
  const topic = TOPICS.find((t) => t.id === activeId)!;

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 120px)" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "grey.900",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1.5, fontWeight: 700 }}
        >
          Day 1 — Labs
        </Typography>
        <Divider />
        <List dense disablePadding>
          {MODULES.map((mod) => (
            <Fragment key={mod}>
              <ListSubheader
                sx={{
                  bgcolor: "grey.800",
                  fontSize: "0.62rem",
                  lineHeight: "26px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                }}
              >
                {mod}
              </ListSubheader>
              {TOPICS.filter((t) => t.module === mod).map((t) => (
                <ListItemButton
                  key={t.id}
                  selected={activeId === t.id}
                  onClick={() => setActiveId(t.id)}
                  sx={{ pl: 2 }}
                >
                  <ListItemText
                    primary={t.label}
                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                  />
                </ListItemButton>
              ))}
            </Fragment>
          ))}
        </List>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
        <Typography variant="overline" color="text.disabled" display="block">
          {topic.module}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {topic.label}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Chip
              label={topic.badLabel ?? "❌ Problem"}
              color="error"
              size="small"
              sx={{ mb: 1.5 }}
            />
            <topic.Bad />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Chip
              label={topic.fixLabel ?? "✅ Fix"}
              color="success"
              size="small"
              sx={{ mb: 1.5 }}
            />
            <topic.Fix />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
