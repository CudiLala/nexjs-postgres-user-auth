import { readFileSync } from "fs";
import crypto from "crypto";
import { Client, PoolClient } from "pg";
import bcrypt from "bcrypt";

export async function createUser(client: Client & PoolClient, body: any) {
  let { full_name, email, phone, password_hash } = await validateCreateUser(
    client,
    body
  );

  let sql = readFileSync(process.cwd() + "/sql/users/create.sql").toString();
  await client.query(sql, [full_name, email, phone, password_hash]);
}

async function doesEmailExist(client: Client & PoolClient, email: string) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "email");

  let resp = await client.query(sql, [email]);

  return resp.rows[0]?.val as boolean;
}

async function doesPhoneExist(client: Client & PoolClient, phone: string) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "phone");

  let resp = await client.query(sql, [phone]);

  return resp.rows[0]?.val as boolean;
}

async function doesTokenExist(client: Client & PoolClient, token: string) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "user_sessions");
  sql = sql.replace("$column", "token");

  let resp = await client.query(sql, [token]);

  return resp.rows[0]?.val as boolean;
}

async function generateToken(client: Client & PoolClient): Promise<string> {
  let token = crypto.randomBytes(32).toString("hex");

  if (await doesTokenExist(client, token)) return await generateToken(client);

  return token;
}

export async function signInUser(
  client: Client & PoolClient,
  body: any
): Promise<{ token: string }> {
  const { user_id } = await validateSignInUser(client, body);

  const token = await generateToken(client);

  await storeSession(client, { user_id, token });

  return { token };
}

async function storeSession(
  client: Client & PoolClient,
  body: {
    user_id: string;
    token: string;
  }
) {
  const { user_id, token } = body;

  let sql = readFileSync(
    process.cwd() + "/sql/auth/store_session.sql"
  ).toString();

  await client.query(sql, [user_id, token]);
}

async function validateCreateUser(
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

async function validateSignInUser(client: Client & PoolClient, body: any) {
  const { email, phone, password } = body;

  if (!(email || phone))
    throw { status: 400, msg: "Field email/phone is required" };
  if (!password) throw { status: 400, msg: "Field password is required" };

  let sql = readFileSync(
    process.cwd() + "/sql/users//get_user_by_email_or_phone.sql"
  ).toString();
  sql = sql.replace("$return_fields", "id, password_hash");

  let resp = await client.query(sql, [email || phone]);

  if (resp.rows[0] === undefined)
    throw { status: 404, msg: "No user found with given email/phone" };

  let password_hash = resp.rows[0]?.password_hash || "";

  if (!(await bcrypt.compare(password, password_hash)))
    throw { status: 400, msg: "Wrong password" };

  return { user_id: resp.rows[0].id };
}
