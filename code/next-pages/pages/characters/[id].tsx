import React from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import Head from "next/head";

const fetchCharacter = async (characterId) => {
  const response = await fetch(`/api/proxy?id=${characterId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function Character() {
  const { query } = useRouter();
  const id = query.id;

  const { data, isLoading, error } = useQuery(
    ["character", id],
    () => fetchCharacter(id),
    {
      // initialData: character,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error?.message}</div>;
  return (
    <main>
      <Head>
        <title>{data?.name} Profile </title>
      </Head>
      <div>
        <h1>{data?.name}</h1>
        <p>Status: {data?.status}</p>
        <p>Species: {data?.species}</p>
        <p>Gender: {data?.gender}</p>
        <p>Origin: {data?.origin.name}</p>
        <p>Location: {data?.location.name}</p>
        <img src={data?.image} alt={`${data?.name}`} />
      </div>
    </main>
  );
}
