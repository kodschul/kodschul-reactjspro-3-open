import { useState, Activity } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

// Simulates an expensive widget whose effects should pause when hidden
function ExpensiveWidget({ label }: { label: string }) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "action.selected",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2">
        <strong>{label}</strong> — state preserved, effects paused while hidden
      </Typography>
      <Typography variant="caption" color="text.secondary">
        (A real implementation could have useEffect subscriptions, scroll
        position, form input, etc. — all preserved without unmounting)
      </Typography>
    </Box>
  );
}

export function ActivityDemo() {
  const [activeTab, setActiveTab] = useState<"inbox" | "drafts">("inbox");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success">
        <AlertTitle>React 19.2: Activity (unstable)</AlertTitle>
        Activity lets you pre-render UI and keep it hidden. The component stays
        mounted — state, refs and scroll position are preserved — but Effects
        pause until the component becomes visible. Perfect for tabs, modals,
        off-screen panels.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`import { Activity } from "react";

// Both tabs stay mounted — only visibility changes
<Activity mode={tab === "inbox" ? "visible" : "hidden"}>
  <InboxTab />          // effects run when visible
</Activity>
<Activity mode={tab === "drafts" ? "visible" : "hidden"}>
  <DraftsTab />         // effects PAUSE when hidden, state preserved
</Activity>

// vs. conditional rendering — unmounts and loses all state
{tab === "inbox" && <InboxTab />}`}</Typography>
      </Alert>

      <Stack direction="row" spacing={1}>
        <Button
          variant={activeTab === "inbox" ? "contained" : "outlined"}
          onClick={() => setActiveTab("inbox")}
        >
          Inbox
        </Button>
        <Button
          variant={activeTab === "drafts" ? "contained" : "outlined"}
          onClick={() => setActiveTab("drafts")}
        >
          Drafts
        </Button>
        <Chip
          label="Both tabs stay mounted in the tree"
          size="small"
          color="info"
          variant="outlined"
        />
      </Stack>

      <Divider />

      {/* Activity keeps components mounted — only their visibility changes */}
      <Activity mode={activeTab === "inbox" ? "visible" : "hidden"}>
        <ExpensiveWidget label="Inbox Tab" />
      </Activity>
      <Activity mode={activeTab === "drafts" ? "visible" : "hidden"}>
        <ExpensiveWidget label="Drafts Tab" />
      </Activity>
    </Box>
  );
}
