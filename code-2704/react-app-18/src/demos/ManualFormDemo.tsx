import { useState, FormEvent } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

function fakeSubmit(data: { name: string; email: string; message: string }) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(
      () => (data.name ? resolve() : reject(new Error("Name is required"))),
      1200
    )
  );
}

export function ManualFormDemo() {
  // One useState per field — scales poorly
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // Manual orchestration of async state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await fakeSubmit({ name, email, message });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Pain Point: Manual Form Handling in React 18</AlertTitle>
        Each field needs its own useState. Pending, error and success states are
        wired up manually. The same try/catch/finally pattern is duplicated
        across every form. React 19 replaces all of this with useActionState.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// React 18 — one useState per field + manual async state management
const [name, setName]       = useState("");
const [loading, setLoading] = useState(false);
const [error, setError]     = useState(null);

async function handleSubmit(e) {
  e.preventDefault();          // manual event wiring
  setLoading(true);            // manual pending flag
  try {
    await submit(data);
    setSuccess(true);
  } catch (err) {
    setError(err.message);     // manual error state
  } finally {
    setLoading(false);
  }
}`}</Typography>
      </Alert>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
      >
        <TextField
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          multiline
          rows={3}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Sent successfully!</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </Box>
    </Box>
  );
}
