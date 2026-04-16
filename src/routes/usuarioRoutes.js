const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Quando houver uma requisição POST na rota raiz deste arquivo, chama o controller
router.post("/", usuarioController.criarUsuario);

module.exports = router;
