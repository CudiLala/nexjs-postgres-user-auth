import Pool from "pg-pool";

let pool = new Pool({
  database: "ridpest",
  user: "ridpest",
  password: "ridpest",
  port: 5432,
  max: 32,
  idleTimeoutMillis: 30000,
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
