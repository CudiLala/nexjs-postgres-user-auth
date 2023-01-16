// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "db/connect";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const client = await pool.connect();

  for (let i = 0; i < 10; i++) {
    const res = await client.query("SELECT true as time");
    console.log(res.rows[0].time);
  }

  client.release();

  res.status(200).json({ name: "John Doe" });
}
