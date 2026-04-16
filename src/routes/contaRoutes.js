const express = require("express");
const router = express.Router();
const contaController = require("../controllers/contaController");

router.get("/:usuarioId", contaController.obterContaEExtrato);

module.exports = router;
