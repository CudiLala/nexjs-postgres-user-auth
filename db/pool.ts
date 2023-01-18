import Pool from "pg-pool";

let pool = new Pool({
  database: process.env.PG_DB_NAME,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  port: 5432,
  max: 32,
  connectionTimeoutMillis: 30000,
});

pool.on("connect", function () {
  console.log(">> postgresql connected");
});

pool.on("error", (e) => {
  console.error("Postgresql Error: \n\t");
  console.error(`Name: ${e.name} \n\t`);
  console.error(`Message: ${e.message} \n\t`);
  console.error(`Cause: ${e.cause} \n\t`);
});

export default pool;
