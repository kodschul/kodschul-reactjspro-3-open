import { useState, useRef } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export function AutoBatchingDemoSimple() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  console.log("RENDER");

  function update() {
    setTimeout(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
    }, 0);
  }

  return <button onClick={update}>Update</button>;
}

export function AutoBatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const renderRef = useRef(0);
  const [rendersAtUpdate, setRendersAtUpdate] = useState(0);

  renderRef.current += 1;

  // React 17: each setState in setTimeout caused its own re-render (2 renders)
  // React 18: both are batched into ONE re-render automatically
  function handleTimeout() {
    const before = renderRef.current;
    setTimeout(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
      setRendersAtUpdate(renderRef.current - before);
    }, 0);
  }

  function handlePromise() {
    const before = renderRef.current;
    Promise.resolve().then(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
      setRendersAtUpdate(renderRef.current - before);
    });
  }

  function handleReset() {
    setCount(0);
    setFlag(false);
    renderRef.current = 0;
    setRendersAtUpdate(0);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success">
        <AlertTitle>React 18: Automatic Batching</AlertTitle>
        In React 17, setState calls inside setTimeout or Promises triggered
        separate re-renders. React 18 batches them automatically everywhere —
        including native event handlers, Promises and setTimeout.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// React 17: 2 re-renders inside setTimeout
// React 18: only 1 re-render (automatic batching)
setTimeout(() => {
  setCount(c => c + 1); // separate render in R17
  setFlag(f => !f);     // separate render in R17
}, 0);`}</Typography>
      </Alert>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="contained" onClick={handleTimeout}>
          setState in setTimeout
        </Button>
        <Button variant="outlined" onClick={handlePromise}>
          setState in Promise
        </Button>
        <Button variant="text" color="error" onClick={handleReset}>
          Reset
        </Button>
      </Stack>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2">
          count: <strong>{count}</strong>
        </Typography>
        <Typography variant="body2">
          flag: <strong>{String(flag)}</strong>
        </Typography>
        <Typography variant="body2">
          Re-renders triggered by last update:{" "}
          <strong>{rendersAtUpdate}</strong> (React 18: should be 1; React 17
          would be 2)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total renders: <strong>{renderRef.current}</strong>
        </Typography>
      </Box>
    </Box>
  );
}
