import { validateJSONContentType } from "@/api_utils";
import { signInUser } from "@/api_utils/users";
import pool from "@/db/pool";
import { NextApiRequest, NextApiResponse } from "next";

export default function signInHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, msg: req.method + " method not allowed" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    validateJSONContentType(req);

    const client = await pool.connect();

    const { token } = await signInUser(client, req.body);

    client.release();
    return res.status(200).json({ success: true, token });
  } catch (err: any) {
    console.log(err);
    const { status = 500, msg = "Unknown Error" } = err;
    return res.status(status).json({ success: false, msg });
  }
}
