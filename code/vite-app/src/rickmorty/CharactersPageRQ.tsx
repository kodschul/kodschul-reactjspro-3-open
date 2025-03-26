import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

type ICharacter = {
  id: string;
  name: string;
  image: string;

  [key: string]: any;
};

const api = axios.create({
  baseURL: "https://rickandmortyapi.com/api",
});

const fetchCharactersAsync = async (page: number) => {
  const response = await api.get(`/character?page=${page}`);
  return response.data.results;
};

const fetchCharactersFetchAsync = async (page: number) => {
  const response = await fetch(
    `https://rickandmortyapi.com/api/character?page=${page}`
  );
  return (await response.json()).results;
};

const CharactersPage = () => {
  const [page, setPage] = useState(1);

  const { data: characters, isLoading } = useQuery<ICharacter[]>({
    queryKey: ["characters" + page],
    queryFn: () => fetchCharactersAsync(page),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div style={styles.main}>
      <h1>Characters</h1>
      <div style={{ display: "flex" }}>
        <button onClick={() => setPage(page - 1)}>Previous</button>
        <span style={{ margin: 5 }}> {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {isLoading && <p>Loading...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {characters?.length &&
          characters?.map((character: ICharacter) => (
            <a href={`/${character.id}`}>
              <Character name={character.name} avatar={character.image} />
            </a>
          ))}
      </div>
    </div>
  );
};

type CharacterProps = {
  name: string;
  avatar: string;
};

const Character = (props: CharacterProps) => {
  return (
    <div
      style={{
        width: 100,
        display: "flex",
        flexDirection: "column",
        background: "rgb(38, 76, 173)",
        marginTop: 10,
        justifyContent: "center",
        color: "white",
        textDecoration: "none",
      }}
    >
      <img src={props.avatar} width={100} />
      {props.name}
    </div>
  );
};

const styles: any = {
  main: {
    minHeight: "100vh",
    width: "100vqw",
    color: "white",
    background: "rgb(0, 0, 46)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharactersPage />
    </QueryClientProvider>
  );
};

export default App;
