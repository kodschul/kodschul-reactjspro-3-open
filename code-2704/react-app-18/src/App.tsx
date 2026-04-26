import { useState } from "react";
import { Box, Chip, Container, Tab, Tabs, Typography } from "@mui/material";
import { BlockingRenderDemo } from "./demos/BlockingRenderDemo";
import { ConcurrentRenderDemo } from "./demos/ConcurrentRenderDemo";
import { AutoBatchingDemo } from "./demos/AutoBatchingDemo";
import { DataFetchDemo } from "./demos/DataFetchDemo";
import { ManualFormDemo } from "./demos/ManualFormDemo";

const DEMOS = [
  {
    id: "blocking",
    label: "Blocking Render (Problem)",
    component: BlockingRenderDemo,
  },
  {
    id: "concurrent",
    label: "Concurrent Render (R18)",
    component: ConcurrentRenderDemo,
  },
  { id: "batching", label: "Auto Batching (R18)", component: AutoBatchingDemo },
  { id: "data-fetch", label: "Data Fetching (Pain)", component: DataFetchDemo },
  { id: "form", label: "Form Handling (Pain)", component: ManualFormDemo },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

export default function App() {
  const [activeDemo, setActiveDemo] = useState<DemoId>("blocking");
  const Demo = DEMOS.find((d) => d.id === activeDemo)!.component;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          bgcolor: "grey.900",
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="md" sx={{ py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip label="React 18" color="primary" size="small" />
            <Typography variant="h6" fontWeight={600}>
              Patterns, Features and Pain Points
            </Typography>
          </Box>
          <Tabs
            value={activeDemo}
            onChange={(_, v) => setActiveDemo(v as DemoId)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {DEMOS.map((demo) => (
              <Tab
                key={demo.id}
                value={demo.id}
                label={demo.label}
                sx={{ fontSize: "0.8rem" }}
              />
            ))}
          </Tabs>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Demo />
      </Container>
    </Box>
  );
}
