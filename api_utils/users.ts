import { readFileSync } from "fs";
import { Client, PoolClient } from "pg";

export async function createUser(
  client: Client & PoolClient,
  body: {
    full_name: string;
    email: string;
    phone: string;
    password_hash: string;
  }
) {
  let { full_name, email, phone, password_hash } = body;

  let sql = readFileSync(process.cwd() + "/sql/users/create.sql").toString();
  await client.query(sql, [full_name, email, phone, password_hash]);
}

export async function doesEmailExist(
  client: Client & PoolClient,
  email: string
) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "email");

  let resp = await client.query(sql, [email]);

  return resp.rows[0].val;
}

export async function doesPhoneExist(
  client: Client & PoolClient,
  phone: string
) {
  let sql = readFileSync(
    process.cwd() + "/sql/does_field_exist_in_table.sql"
  ).toString();

  sql = sql.replace("$table", "users");
  sql = sql.replace("$column", "phone");

  let resp = await client.query(sql, [phone]);

  return resp.rows[0].val;
}
