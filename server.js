require("dotenv").config();
const express = require("express");
const pool = require("./database");

const app = express();

app.use(express.json());

const usuarioRoutes = require("./src/routes/usuarioRoutes");
app.use("/usuarios", usuarioRoutes);

const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

const contaRoutes = require("./src/routes/contaRoutes");
app.use("/contas", contaRoutes);

const transacaoRoutes = require("./src/routes/transacaoRoutes");
app.use("/transacoes", transacaoRoutes);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
