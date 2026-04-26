import { useState, useOptimistic, useTransition } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

type Comment = { id: number; text: string; pending?: boolean };

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, text: "Great post!" },
  { id: 2, text: "Thanks for sharing." },
];

async function fakeAddComment(text: string): Promise<Comment> {
  await new Promise((r) => setTimeout(r, 1500));
  return { id: Date.now(), text };
}

export function OptimisticDemo() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment]
  );

  function handleSubmit() {
    if (!text.trim()) return;
    const optimistic: Comment = { id: Date.now(), text, pending: true };

    startTransition(async () => {
      addOptimistic(optimistic); // show immediately (optimistic)
      const saved = await fakeAddComment(text); // actual async op
      setComments((prev) => [...prev, saved]); // commit real result
    });

    setText("");
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success">
        <AlertTitle>React 19: useOptimistic</AlertTitle>
        Show the result of an action immediately in the UI before the server
        responds. If the server fails the optimistic update is automatically
        rolled back to the previous state.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`const [optimisticComments, addOptimistic] = useOptimistic(
  comments,
  (state, newComment) => [...state, newComment], // optimistic updater
);

startTransition(async () => {
  addOptimistic(optimisticItem);  // UI updates instantly
  const real = await saveToServer(data);
  setComments(prev => [...prev, real]); // commit real value
});`}</Typography>
      </Alert>

      <Divider />

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          label="Add a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          sx={{ flex: 1 }}
          disabled={isPending}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          startIcon={
            isPending ? <CircularProgress size={14} color="inherit" /> : null
          }
        >
          Post
        </Button>
      </Box>

      <List dense>
        {optimisticComments.map((c) => (
          <ListItem
            key={c.id}
            divider
            sx={{ opacity: c.pending ? 0.55 : 1 }}
            secondaryAction={
              c.pending ? (
                <Chip label="saving..." size="small" color="warning" />
              ) : null
            }
          >
            <ListItemText primary={c.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
