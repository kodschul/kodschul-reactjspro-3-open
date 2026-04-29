import CharacterList from "./CharacterList";

// const fetchCharacters = async () => {
//   return (
//     await (await fetch("https://rickandmortyapi.com/api/character")).json()
//   )?.results;
// };

export default async function Home() {
  await new Promise((r) => setTimeout(r, 500));
  //   const characters = await fetchCharacters();

  return (
    <div className="flex flex-col flex-1  items-center justify-center  font-sans">
      <div>Welcome Server RickMorty</div>

      {/* <CharacterList characters={[]} /> */}
    </div>
  );
}
