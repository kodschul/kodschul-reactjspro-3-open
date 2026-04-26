import { useActionState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

type FormState = { error: string | null; success: boolean };

async function submitAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await new Promise((r) => setTimeout(r, 1200));
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Name is required", success: false };
  return { error: null, success: true };
}

export function ActionsDemo() {
  const [state, action, isPending] = useActionState(submitAction, {
    error: null,
    success: false,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success">
        <AlertTitle>React 19: Actions + useActionState</AlertTitle>
        Async functions used as form actions. Pending state, errors and the
        result are all managed by useActionState — no manual useState
        orchestration needed. Works with native HTML forms (FormData) and
        progressive enhancement.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// React 19 — replaces 5 useState + try/catch boilerplate
const [state, action, isPending] = useActionState(
  async (prev, formData) => {
    await submit(formData);         // async, no e.preventDefault() needed
    return { error: null, success: true };
  },
  { error: null, success: false },  // initial state
);

// Form just needs action={action} — no onSubmit handler
<form action={action}>
  <input name="name" />
  <button disabled={isPending}>Submit</button>
</form>`}</Typography>
      </Alert>

      <Box
        component="form"
        action={action}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
      >
        <TextField label="Name *" name="name" disabled={isPending} />
        <TextField
          label="Email"
          name="email"
          type="email"
          disabled={isPending}
        />
        <TextField
          label="Message"
          name="message"
          multiline
          rows={3}
          disabled={isPending}
        />

        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.success && <Alert severity="success">Sent successfully!</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isPending ? "Sending..." : "Send Message"}
        </Button>
      </Box>
    </Box>
  );
}
