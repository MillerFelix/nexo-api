const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.post("/", usuarioController.criarUsuario);

router.put("/perfil", verificarToken, usuarioController.atualizarPerfil);

module.exports = router;
