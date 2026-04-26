import { useState } from "react";
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

// Simulated product data
const PRODUCTS = [
  {
    id: "headphones",
    name: "Studio Headphones",
    category: "Audio",
    description: "Premium noise-cancelling headphones for professionals.",
  },
  {
    id: "keyboard",
    name: "Mechanical Keyboard",
    category: "Peripherals",
    description: "Tactile switches with per-key RGB lighting.",
  },
];

type ProductId = (typeof PRODUCTS)[number]["id"];

export function MetadataDemo() {
  const [activeId, setActiveId] = useState<ProductId>("headphones");
  const product = PRODUCTS.find((p) => p.id === activeId)!;

  // In React 19, <title>, <meta> and <link> placed anywhere in the component tree
  // are automatically hoisted to <head> — no react-helmet needed.
  const pageTitle = `${product.name} — My Store`;
  const description = product.description;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="success">
        <AlertTitle>React 19: Document Metadata</AlertTitle>
        Place title, meta and link tags directly in any component. React hoists
        them to the document head automatically. No react-helmet, no custom
        hooks.
      </Alert>

      <Alert severity="info" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`// React 19 — works in any component, even nested ones
function ProductPage({ product }) {
  return (
    <>
      <title>{product.name} — My Store</title>
      <meta name="description" content={product.description} />
      <link rel="canonical" href={"/products/" + product.id} />

      <h1>{product.name}</h1>
      {/* ... */}
    </>
  );
}

// React automatically deduplicates and hoists to <head>`}</Typography>
      </Alert>

      <Stack direction="row" spacing={1}>
        {PRODUCTS.map((p) => (
          <Button
            key={p.id}
            variant={p.id === activeId ? "contained" : "outlined"}
            onClick={() => setActiveId(p.id as ProductId)}
            size="small"
          >
            {p.name}
          </Button>
        ))}
      </Stack>

      <Divider />

      {/* In a real React 19 app these tags render into <head> */}
      {/* We show a preview box instead since this demo runs in an iframe */}
      <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          What React 19 injects into {"<head>"}
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", mt: 1, whiteSpace: "pre-wrap" }}
        >{`<title>${pageTitle}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="/products/${product.id}" />`}</Typography>
      </Box>

      <Box>
        <Chip
          label={`Category: ${product.category}`}
          size="small"
          sx={{ mr: 1 }}
        />
        <Typography variant="h6" sx={{ mt: 1 }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
      </Box>
    </Box>
  );
}
