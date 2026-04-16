const pool = require("../../database");

const obterContaEExtrato = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;

    const queryConta = `SELECT id, numero_conta, saldo, criado_em FROM contas WHERE usuario_id = ?`;
    const [resultadoConta] = await pool.execute(queryConta, [usuarioId]);

    if (resultadoConta.length === 0) {
      return res
        .status(404)
        .json({ erro: "Conta não encontrada para este usuário." });
    }

    const conta = resultadoConta[0];

    const queryExtrato = `
            SELECT id, tipo, valor, descricao, data_transacao, conta_origem_id, conta_destino_id 
            FROM transacoes 
            WHERE conta_origem_id = ? OR conta_destino_id = ?
            ORDER BY data_transacao DESC
            LIMIT 50
        `;
    const [extrato] = await pool.execute(queryExtrato, [conta.id, conta.id]);

    return res.status(200).json({
      conta: {
        numero: conta.numero_conta,
        agencia: "0001",
        saldo: parseFloat(conta.saldo),
      },
      extrato: extrato,
    });
  } catch (erro) {
    console.error("Erro ao buscar conta e extrato:", erro);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

module.exports = { obterContaEExtrato };
