"use client";
import { useState } from "react";

const CharacterList = ({ characters }) => {
  const [charactersArr, setCharactersArr] = useState(characters);

  return (
    <>
      {charactersArr.map((character) => (
        <div
          key={character.id}
          onClick={() =>
            setCharactersArr((prev) =>
              prev.filter((x) => x.id !== character.id)
            )
          }
        >
          {character.name}
        </div>
      ))}
    </>
  );
};

export default CharacterList;
