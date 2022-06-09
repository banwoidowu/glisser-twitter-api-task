const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.databaseUser || "postgres",
  password: process.env.databasePassword,
  host: process.env.databaseHost || "localhost",
  port: process.env.databasePort || 5432,
  database: process.env.databaseName,
});

module.exports = pool;
