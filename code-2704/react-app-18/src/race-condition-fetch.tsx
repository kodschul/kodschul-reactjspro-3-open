import { useEffect, useLayoutEffect, useState } from "react";

type Character = {
  id: string;
  name: string;
};

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const slow = async (queryNum) => {
    // await new Promise((r) => setTimeout(r, queryNum == 1 ? 3000 : 500));
  };

  useEffect(() => {
    const controller = new AbortController();
    const queryNum = parseInt(query);
    if (!queryNum || queryNum < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    slow(queryNum).then(() => {
      fetch(`https://rickandmortyapi.com/api/character/?page=${queryNum}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setResults(data.results);
          setIsLoading(false);
        })
        .catch((e) => {
          // aborted
        });
    });

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Stadt eingeben..."
      />
      {isLoading && <span>Lädt...</span>}
      <ul>
        {results.map((character: Character) => (
          <li key={character.id}>{character.name}</li>
        ))}
      </ul>
    </div>
  );
}
