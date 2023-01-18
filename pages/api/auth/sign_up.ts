import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import pool from "@/db/pool";

export default async function signUpHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    return res.status(405);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    validateContentType(req);

    const client = await pool.connect();

    const { full_name, email, phone, hashPassword } = await validatePost(
      req.body
    );

    client.release();
    return res.status(200).json({ success: true });
  } catch (err: any) {
    const { status = 500, msg = "Unknown Error" } = err;
    return res.status(status).json({ success: false, msg });
  }
}

async function validatePost(body: any): Promise<{
  full_name: string;
  email: string;
  phone: string;
  hashPassword: string;
}> {
  const { full_name, email, phone, password, confirmPassword } = body;

  if (!full_name) throw { status: 400, msg: "Field full_name is required" };
  if (!email) throw { status: 400, msg: "Field email is required" };
  if (!phone) throw { status: 400, msg: "Field phone is required" };
  if (!password) throw { status: 400, msg: "Field password is required" };

  if (full_name > 100)
    throw {
      status: 400,
      msg: "Full name should not be more than 100 characters",
    };
  if (email > 100)
    throw {
      status: 400,
      msg: "Email should not be more than 100 characters",
    };
  if (password !== confirmPassword)
    throw { status: 400, msg: "passwords do not match" };

  const hashPassword = await bcrypt.hash(password, 4);

  return { full_name, email, phone, hashPassword };
}

function validateContentType(req: NextApiRequest) {
  if (req.headers["content-type"] !== "application/json")
    throw {
      status: 400,
      msg: "Invalid content type. Only application/json accepted",
    };
}
