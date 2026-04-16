require("dotenv").config();
const express = require("express");
const pool = require("./database");

const app = express();

app.use(express.json());

const usuarioRoutes = require("./src/routes/usuarioRoutes");
app.use("/usuarios", usuarioRoutes);

const contaRoutes = require("./src/routes/contaRoutes");
app.use("/contas", contaRoutes);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
