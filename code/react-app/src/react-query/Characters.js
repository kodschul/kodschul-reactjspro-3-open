import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";

const fetchCharacters = async (page) => {
  const res = await axios.get("https://rickandmortyapi.com/api/character", {
    params: { page },
  });
  return res?.data?.results;
};

const Characters = () => {
  const [page, setPage] = useState(1);
  const { data: characters } = useQuery(
    ["characters", page],
    () => fetchCharacters(page),
    {
      retry: 3,
    }
  );

  return (
    <div>
      Characters
      <div style={{ display: "flex" }}>
        {characters?.map?.((character) => (
          <div key={character.id} style={{ margin: 20 }}>
            <img src={character.image} width={100} />
            <div>{character.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Characters;
