import { Suspense, use, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

type Post = { id: number; title: string; body: string };

// fetch function (pure, no state)
function fetchPosts(): Promise<Post[]> {
  return fetch("https://jsonplaceholder.typicode.com/posts?_limit=5").then(
    (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }
  );
}

// posts renderer (Suspense boundary reads data)
function Posts({ promise }: { promise: Promise<Post[]> }) {
  const posts = use(promise);

  return (
    <List dense>
      {posts.map((p) => (
        <ListItem key={p.id} divider>
          <ListItemText
            primary={p.title}
            secondary={p.body.slice(0, 80) + "..."}
          />
        </ListItem>
      ))}
    </List>
  );
}

export function UseApiDemo() {
  // 👇 THIS replaces: useState + useEffect + AbortController + loading state
  const [promise, setPromise] = useState(() => fetchPosts());

  const [counter, setCounter] = useState(0);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Pain Point solved (React 19 model)</AlertTitle>
        No loading state, no useEffect, no AbortController, no manual guards. UI
        simply suspends while data loads.
      </Alert>

      <Button
        variant="outlined"
        size="small"
        onClick={() => setCounter(counter + 1)}
      >
        incr
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => setPromise(fetchPosts())}
      >
        Refetch
      </Button>

      <Divider />

      {/* Suspense replaces loading + error handling UI */}
      <Suspense
        fallback={
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading posts...</Typography>
          </Box>
        }
      >
        <Posts promise={promise} />
      </Suspense>
    </Box>
  );
}
