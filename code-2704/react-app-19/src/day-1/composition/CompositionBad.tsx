import { Alert, Box, Chip, Typography } from "@mui/material";

// ❌ Prop drilling — Layout and Header receive `user` only to pass it deeper

function UserBadge({ user }: { user: string }) {
  return <Chip label={user} size="small" color="primary" />;
}

function Header({ title, user }: { title: string; user: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography fontWeight={700}>{title}</Typography>
      <UserBadge user={user} /> {/* Header doesn't use user — just passes it */}
    </Box>
  );
}

function Layout({ title, user }: { title: string; user: string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
      <Header title={title} user={user} />{" "}
      {/* Layout doesn't use user either */}
      <Typography variant="body2" color="text.secondary">
        Page content
      </Typography>
    </Box>
  );
}

export function CompositionBad() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Layout and Header carry `user` only to hand it down — prop drilling
      </Alert>
      <Layout title="Dashboard" user="Franz" />
    </Box>
  );
}
