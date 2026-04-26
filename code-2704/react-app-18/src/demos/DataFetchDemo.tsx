import { useState, useEffect } from "react";
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

export function DataFetchDemo() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchPosts() {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPosts([]);

    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5", {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Post[]>;
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });

    return controller;
  }

  useEffect(() => {
    const controller = fetchPosts();
    return () => controller.abort();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Pain Point: Manual Data Fetching in React 18</AlertTitle>
        Every fetch requires the same boilerplate: 3 useState calls, a
        useEffect, AbortController, and manual if(loading)/if(error) guards
        repeated across every component. React 19 solves this with the use()
        hook and Suspense.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// Boilerplate required in EVERY component that fetches data
const [data, setData]       = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError]     = useState(null);

useEffect(() => {
  setLoading(true);
  fetch(url)
    .then(r => r.json()).then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

if (loading) return <Spinner />;   // manual guard
if (error)   return <Error />;     // manual guard`}</Typography>
      </Alert>

      <Button
        variant="outlined"
        size="small"
        onClick={() => fetchPosts()}
        disabled={loading}
      >
        Refetch
      </Button>

      <Divider />

      {loading && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading posts...</Typography>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && posts.length > 0 && (
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
      )}
    </Box>
  );
}
