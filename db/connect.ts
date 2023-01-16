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

let acquireCount = 0;
pool.on("acquire", function () {
  console.log("acquire", acquireCount++);
});

let connectCount = 0;
pool.on("connect", function () {
  console.log("connect", connectCount++);
});

export default pool;
