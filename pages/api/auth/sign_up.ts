import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import pool from "@/db/pool";
import { readFileSync } from "fs";
import { Client, PoolClient } from "pg";

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
    validateJSONContentType(req);

    const client = await pool.connect();

    const { full_name, email, phone, password_hash } = await validatePost(
      client,
      req.body
    );

    const { userId } = await createUser(client, {
      full_name,
      email,
      phone,
      password_hash,
    });

    console.log(userId);

    client.release();
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.log(err);
    const { status = 500, msg = "Unknown Error" } = err;
    return res.status(status).json({ success: false, msg });
  }
}

async function createUser(
  client: Client & PoolClient,
  body: {
    full_name: string;
    email: string;
    phone: string;
    password_hash: string;
  }
) {
  let { full_name, email, phone, password_hash } = body;

  let sql = readFileSync(process.cwd() + "/sql/auth/sign_up.sql").toString();
  let resp = await client.query(sql, [full_name, email, phone, password_hash]);

  return { userId: resp.rows[0] };
}

async function validatePost(
  client: Client & PoolClient,
  body: any
): Promise<{
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
}> {
  let { full_name, email, phone, password, confirmPassword } = body;

  full_name = String(full_name);
  email = String(email);
  phone = String(phone);
  password = String(password);
  confirmPassword = String(confirmPassword);

  if (!full_name) throw { status: 400, msg: "Field full_name is required" };
  if (!email) throw { status: 400, msg: "Field email is required" };
  if (!phone) throw { status: 400, msg: "Field phone is required" };
  if (!password) throw { status: 400, msg: "Field password is required" };

  if (full_name.length > 150)
    throw {
      status: 400,
      msg: "Full name should not be more than 100 characters",
    };
  if (email.length > 150)
    throw {
      status: 400,
      msg: "Email should not be more than 100 characters",
    };
  if (phone.length > 50)
    throw {
      status: 400,
      msg: "Invalid phone number",
    };
  if (password !== confirmPassword)
    throw { status: 400, msg: "Passwords do not match" };

  if (await doesEmailExist(client, email))
    throw { status: 400, msg: "Email already exits" };

  if (await doesPhoneExist(client, phone))
    throw { status: 400, msg: "Phone number already exits" };

  const password_hash = await bcrypt.hash(password, 4);

  return { full_name, email, phone, password_hash };
}

async function doesEmailExist(client: Client & PoolClient, email: string) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "email");

  let resp = await client.query(sql, [email]);

  return resp.rows[0].val;
}

async function doesPhoneExist(client: Client & PoolClient, phone: string) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "phone");

  let resp = await client.query(sql, [phone]);

  return resp.rows[0].val;
}

function validateJSONContentType(req: NextApiRequest) {
  if (req.headers["content-type"] !== "application/json")
    throw {
      status: 400,
      msg: "Invalid content type. Only application/json accepted",
    };
}
