import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

// ---------------------------------------------------------------------------
// useLatestCallback — stable reference that always calls the latest version
// ---------------------------------------------------------------------------
function useLatestCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    []
  ) as T;
}

// ---------------------------------------------------------------------------
// Simple debounce utility (no external dependency needed)
// ---------------------------------------------------------------------------
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ---------------------------------------------------------------------------
// SearchBox — uses useLatestCallback so the debounced keydown handler always
// sees the latest onSearch prop without being recreated on every render
// ---------------------------------------------------------------------------
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const stableOnSearch = useLatestCallback(onSearch);

  useEffect(() => {
    const handler = debounce((e: unknown) => {
      stableOnSearch((e as KeyboardEvent).key);
    }, 300);
    window.addEventListener("keydown", handler as EventListener);
    return () =>
      window.removeEventListener("keydown", handler as EventListener);
  }, []); // stableOnSearch is stable, but always holds the latest value

  return (
    <TextField
      label="Type anywhere (keydown listener)"
      fullWidth
      size="small"
      InputProps={{ readOnly: true }}
    />
  );
}

// ---------------------------------------------------------------------------
// Demo wrapper
// ---------------------------------------------------------------------------
export function StaleClosureDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [prefix, setPrefix] = useState("key:");

  // onSearch changes every render because prefix is captured in the closure —
  // without useLatestCallback the debounced handler would always use the
  // stale version from the first render
  const onSearch = (q: string) => {
    setLog((prev) => [`${prefix} ${q}`, ...prev].slice(0, 8));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="info">
        <AlertTitle>Lösung: useRef für stabile Callbacks</AlertTitle>
        Wenn ein Callback auf aktuellen State oder Props zugreifen muss, aber
        gleichzeitig stabil bleiben soll — useLatestCallback kombiniert useRef +
        useLayoutEffect + useCallback([]).
      </Alert>

      <Alert severity="warning" icon={false}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontFamily: "monospace", m: 0, whiteSpace: "pre-wrap" }}
        >{`function useLatestCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback; // always up-to-date
  });

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    []          // stable reference, never recreated
  ) as T;
}

// Einsatz
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const stableOnSearch = useLatestCallback(onSearch);

  useEffect(() => {
    const handler = debounce(stableOnSearch, 300);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // stableOnSearch ist stabil, enthält aber immer den neuesten Wert
}`}</Typography>
      </Alert>

      <Divider />

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Prefix (changes closure)"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          size="small"
          sx={{ width: 220 }}
        />
        <Typography variant="caption" color="text.secondary">
          Change the prefix, then type — the log always shows the current prefix
          because useLatestCallback captures the latest onSearch.
        </Typography>
      </Box>

      <SearchBox onSearch={onSearch} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {log.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Press any key…
          </Typography>
        ) : (
          log.map((entry, i) => (
            <Chip
              key={i}
              label={entry}
              size="small"
              sx={{ alignSelf: "flex-start" }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
