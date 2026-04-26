import { useState } from "react";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { ActionsDemo } from "./demos/ActionsDemo";
import { UseApiDemo } from "./demos/UseApiDemo";
import { OptimisticDemo } from "./demos/OptimisticDemo";
import { MetadataDemo } from "./demos/MetadataDemo";
import { ActivityDemo } from "./demos/ActivityDemo";
import { StaleClosureDemo } from "./day-1/stale-closures/stale-closure";
import { Day1 } from "./day-1/Day1";

const DEMOS = [
  { id: "actions", label: "Actions + useActionState", component: ActionsDemo },
  { id: "use", label: "use() API", component: UseApiDemo },
  { id: "optimistic", label: "useOptimistic", component: OptimisticDemo },
  { id: "metadata", label: "Document Metadata", component: MetadataDemo },
  { id: "activity", label: "Activity (19.2)", component: ActivityDemo },
  { id: "stale_closure", label: "StaleClosure", component: StaleClosureDemo },
  { id: "day1", label: "Day 1 Labs", component: Day1 },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

export default function App() {
  const [activeDemo, setActiveDemo] = useState<DemoId>("actions");

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          New APIs and Features
        </Typography>
        <Tabs
          value={activeDemo}
          onChange={(_, v) => setActiveDemo(v as DemoId)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {DEMOS.map((demo) => (
            <Tab key={demo.id} value={demo.id} label={demo.label} />
          ))}
        </Tabs>
        {DEMOS.find((demo) => demo.id === activeDemo)?.component && (
          <>
            {(() => {
              const Component = DEMOS.find(
                (demo) => demo.id === activeDemo
              )?.component;
              return Component ? <Component /> : null;
            })()}
          </>
        )}
      </Container>
    </Box>
  );
}
