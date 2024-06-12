import React, { useState } from "react";
import axios from "axios";
import useSWR, { preload } from "swr";

const axiosInstance = axios.create({ baseURL: "https://rickandmortyapi.com" });

const fetcher = async (url) => {
  const res = await axiosInstance.get(url);
  return res?.data?.results;
};

preload("/api/character?page=2", fetcher);

const Characters = () => {
  const [page, setPage] = useState(1);

  const { data: characters, mutate } = useSWR(
    `/api/character?page=${page}`,
    fetcher,
    {
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      dedupingInterval: 10000,
      keepPreviousData: true,
    }
  );

  const clear = () => {
    mutate(`/api/character?page=${page}`);
  };

  return (
    <div>
      Characters
      <button onClick={() => setPage(page - 1)}>Back</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
      <button onClick={() => clear()}>Clear</button>
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
