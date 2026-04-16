const mysql = require("mysql2/promise");

require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("📦 Conectado ao banco de dados MySQL com sucesso!");
    connection.release();
  })
  .catch((err) => {
    console.error(
      "❌ Erro ao conectar no MySQL. Verifique o .env e se o banco está rodando.",
    );
    console.error("Detalhe do erro:", err.message);
  });

module.exports = pool;
