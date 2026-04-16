const express = require("express");
const router = express.Router();
const transacaoController = require("../controllers/transacaoController");

const { verificarToken } = require("../middlewares/authMiddleware");

router.use(verificarToken);

router.post("/deposito", transacaoController.depositar);
router.post("/transferencia", transacaoController.transferir);
router.post("/pagamento", transacaoController.pagar);

module.exports = router;
