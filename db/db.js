const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  port: 3306,
  database: "book",
});

module.exports = pool;
