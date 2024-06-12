// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const fetchCharacter = async (characterId) => {
  // await new Promise((r) => setTimeout(r, 2000));
  const response = await fetch(
    `https://rickandmortyapi.com/api/character/${characterId}`
  );

  return response.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await fetchCharacter(req.query.id);
  res.status(200).json(data);
}
