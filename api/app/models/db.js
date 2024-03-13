const mysql = require("mysql2");
const dbConfig = require("../config/db.config.js");

// Create a connection to the database
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  socketPath: dbConfig.SOCKET_PATH,
  connectionLimit: 10,
});

const keepConnectionAlive = async () => {
  try {
    const connection = await pool.promise().getConnection();
    console.log("Connected to the database");

    await connection.query("SELECT 1");
    console.log("Connection live");

    connection.release();
  } catch (err) {
    console.error("Error:", err);
  }
};

const interval = 120000; 
setInterval(keepConnectionAlive, interval);

module.exports = pool;
