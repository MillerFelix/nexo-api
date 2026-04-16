const express = require("express");
const router = express.Router();
const transacaoController = require("../controllers/transacaoController");

router.post("/deposito", transacaoController.depositar);
router.post("/transferencia", transacaoController.transferir);

module.exports = router;
