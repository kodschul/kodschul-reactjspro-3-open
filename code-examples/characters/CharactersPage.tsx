"use client";

import React, { useEffect, useState } from "react";

function CharactersPage({ initialCharacters = [] }) {
  const [page, setPage] = useState(1);
  const [characters, setCharacters] = useState(initialCharacters);

  const fetchCharacters = async () => {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(
      `https://rickandmortyapi.com/api/character?page=${page}`
    );
    const newCharacters = (await res.json())?.results;
    setCharacters(newCharacters);
  };

  useEffect(() => {
    fetchCharacters();
  }, [page]);

  return (
    <div className="min-h-screen min-w-screen flex flex-col flex-1 items-center justify-center">
      <div className="text-4xl font-bold ">The Rick And Morty API</div>

      <div className="my-4">
        <button
          className="p-4 bg-amber-300"
          onClick={() => setPage(page - 1 || 1)}
        >
          Prev Page{" "}
        </button>
        {page}
        <button className="p-4 bg-amber-300" onClick={() => setPage(page + 1)}>
          Next Page{" "}
        </button>
      </div>

      <div className="grid grid-cols-7 ">
        {characters.map((character) => (
          <div key={character.id}>
            <img className="w-28 h-28  " src={character.image} />

            <div>{character.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharactersPage;
