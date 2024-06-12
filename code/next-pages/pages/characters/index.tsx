import Link from "next/link";
import React, { useState } from "react";
import { useQuery } from "react-query";

const Index = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");

  const fetchCharacters = ({ queryKey }) => {
    const [_key, { page }] = queryKey;
    return fetch(`https://rickandmortyapi.com/api/character?page=${page}`).then(
      (res) => res.json()
    );
  };

  const { data, isLoading, error, isPreviousData } = useQuery(
    ["characters", { page }],
    fetchCharacters,
    {
      keepPreviousData: true,
    }
  );

  const sortCharacters = (characters) => {
    return characters.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "species") {
        return a.species.localeCompare(b.species);
      }
    });
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error)
    return <div className="error">An error has occurred: {error.message}</div>;

  const sortedCharacters = data ? sortCharacters([...data.results]) : [];

  return (
    <main className="min-h-screen w-full p-4 md:p-12 bg-gray-900  text-white">
      <div className=" grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-10">
        {sortedCharacters.map((character) => (
          <Link
            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-600"
            key={character.id}
            href={"/characters/" + character.id}
          >
            <img
              src={character.image}
              alt={character.name}
              className="w-full object-cover"
            />
            <div className=" mt-2 text-xl md:text-2xl font-bold ">
              {character.name}
            </div>

            <div>{character.species}</div>
          </Link>
        ))}
      </div>
    </main>
  );

  // return (
  //   <div className="container">
  //     <div className="sort-select">
  //       <label htmlFor="sort">Sort page by:</label>
  //       <select
  //         id="sort"
  //         value={sortBy}
  //         onChange={(e) => setSortBy(e.target.value)}
  //       >
  //         <option value="name">Name</option>
  //         <option value="species">Species</option>
  //       </select>
  //     </div>
  //     <div className="characters-grid"></div>
  //     <div className="pagination">
  //       <button
  //         onClick={() => setPage((old) => Math.max(old - 1, 1))}
  //         disabled={page === 1}
  //         className="button"
  //       >
  //         Previous Page
  //       </button>
  //       <button
  //         onClick={() => {
  //           if (!isPreviousData && data.info.next) {
  //             setPage((old) => old + 1);
  //           }
  //         }}
  //         disabled={isPreviousData || !data.info.next}
  //         className="button"
  //       >
  //         Next Page
  //       </button>
  //     </div>
  //   </div>
  // );
};

export default Index;
