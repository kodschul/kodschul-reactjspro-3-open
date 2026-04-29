import CharactersPage from "./CharactersPage";

const fetchCharacters = async () => {
  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch(`https://rickandmortyapi.com/api/character?page=1}`);
  return (await res.json())?.results;
};

async function CharactersServerPage() {
  const initialCharacters = await fetchCharacters();
  return <CharactersPage initialCharacters={initialCharacters} />;
}

export default CharactersServerPage;
