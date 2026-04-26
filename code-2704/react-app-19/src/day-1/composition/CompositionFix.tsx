import { type ReactNode } from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";

// ✅ Composition — Layout and Header accept slots; they know nothing about `user`

function UserBadge({ user }: { user: string }) {
  return <Chip label={user} size="small" color="primary" />;
}

function Header({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography fontWeight={700}>{title}</Typography>
      {action} {/* generic slot — caller decides what goes here */}
    </Box>
  );
}

function Layout({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
      {header}
      {children}
    </Box>
  );
}

export function CompositionFix() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Alert severity="success" sx={{ fontSize: "0.75rem" }}>
        Caller composes the exact content — Layout and Header stay generic
      </Alert>
      <Layout
        header={
          <Header title="Dashboard" action={<UserBadge user="Franz" />} />
        }
      >
        <Typography variant="body2" color="text.secondary">
          Page content
        </Typography>
      </Layout>
    </Box>
  );
}
