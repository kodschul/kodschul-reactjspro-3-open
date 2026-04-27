import { useState, useTransition, useDeferredValue } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

function filterItems(query: string) {
  const start = performance.now();
  while (performance.now() - start < 30) {}
  return Array.from({ length: 10_000 }, (_, i) => `Item ${i + 1}`)
    .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 20);
}

export function ConcurrentRenderDemo() {
  const [text, setText] = useState("");
  const [list, setList] = useState(
    Array.from({ length: 10_000 }, (_, i) => "item" + i)
  );
  const [isPending, startTransition] = useTransition();

  const deferredVal = useDeferredValue(list);

  console.log("len", list.length);
  console.log("deffered_len", deferredVal.length);

  function handleChange(e) {
    const value = e.target.value;

    setText(value); // urgent (input updates immediately)

    // setList(Array.from({ length: 10_000 }, (_, i) => value + i));

    console.log("lef_after:", list.length + 1);
    setList([...list, value]);

    // console.log("len_before:", list.length);
    // startTransition(() => {
    //   // non-urgent (can be delayed)
    //   // @ts-ignore

    // });
  }

  return (
    <>
      <input value={text} onChange={handleChange} />
      {isPending && <p>Updating list...</p>}
      {list.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </>
  );
}

// without deffered lagging
export function ConcurrentRenderDemo222() {
  const [text, setText] = useState("");

  const list = Array.from({ length: 10_000 }, (_, i) => `Item ${i}`).filter(
    (item) => item.toLowerCase().includes(text.toLowerCase())
  );

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />

      <p>Typing: {text}</p>

      {list.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </>
  );
}

// with deffered not lagging
export function ConcurrentRenderDemo22() {
  const [text, setText] = useState("");

  // 🔑 deferred version of input
  const deferredText = useDeferredValue(text);

  const list = Array.from({ length: 10_000 }, (_, i) => `Item ${i}`).filter(
    (item) => item.toLowerCase().includes(deferredText.toLowerCase())
  );

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />

      <p>Typing: {text}</p>
      <p>Searching: {deferredText}</p>

      {list.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </>
  );
}
