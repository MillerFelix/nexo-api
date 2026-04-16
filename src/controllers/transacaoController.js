const pool = require("../../database");

const depositar = async (req, res) => {
  const conexao = await pool.getConnection();

  try {
    const { contaId, valor, descricao } = req.body;

    if (valor <= 0) {
      conexao.release();
      return res
        .status(400)
        .json({ erro: "O valor do depósito deve ser maior que zero." });
    }

    const [resultadoConta] = await conexao.execute(
      `SELECT id FROM contas WHERE id = ?`,
      [contaId],
    );

    if (resultadoConta.length === 0) {
      conexao.release();
      return res.status(404).json({ erro: "Conta não encontrada no sistema." });
    }

    await conexao.beginTransaction();

    const queryUpdate = `UPDATE contas SET saldo = saldo + ? WHERE id = ?`;
    await conexao.execute(queryUpdate, [valor, contaId]);

    const queryExtrato = `
            INSERT INTO transacoes (conta_destino_id, tipo, valor, descricao) 
            VALUES (?, 'DEPOSITO', ?, ?)
        `;
    const desc = descricao || "Depósito em conta";
    await conexao.execute(queryExtrato, [contaId, valor, desc]);

    await conexao.commit();
    return res
      .status(200)
      .json({ mensagem: "Depósito realizado com sucesso!" });
  } catch (erro) {
    await conexao.rollback();
    console.error("Erro no depósito:", erro);
    return res.status(500).json({ erro: "Erro interno ao realizar depósito." });
  } finally {
    if (conexao) conexao.release();
  }
};

const transferir = async (req, res) => {
  const conexao = await pool.getConnection();

  try {
    const { contaOrigemId, contaDestinoId, valor, descricao } = req.body;

    if (contaOrigemId === contaDestinoId) {
      conexao.release();
      return res
        .status(400)
        .json({ erro: "Não é possível transferir para a mesma conta." });
    }
    if (valor <= 0) {
      conexao.release();
      return res.status(400).json({ erro: "O valor deve ser maior que zero." });
    }

    await conexao.beginTransaction();

    const [resultadoOrigem] = await conexao.execute(
      `SELECT saldo FROM contas WHERE id = ?`,
      [contaOrigemId],
    );

    if (resultadoOrigem.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ erro: "Conta de origem não encontrada." });
    }

    const saldoOrigem = parseFloat(resultadoOrigem[0].saldo);

    if (saldoOrigem < valor) {
      await conexao.rollback();
      return res
        .status(400)
        .json({ erro: "Saldo insuficiente para a transferência." });
    }

    await conexao.execute(`UPDATE contas SET saldo = saldo - ? WHERE id = ?`, [
      valor,
      contaOrigemId,
    ]);

    await conexao.execute(`UPDATE contas SET saldo = saldo + ? WHERE id = ?`, [
      valor,
      contaDestinoId,
    ]);

    const queryExtrato = `
            INSERT INTO transacoes (conta_origem_id, conta_destino_id, tipo, valor, descricao) 
            VALUES (?, ?, 'TRANSFERENCIA_INTERNA', ?, ?)
        `;
    const desc = descricao || "Transferência enviada";
    await conexao.execute(queryExtrato, [
      contaOrigemId,
      contaDestinoId,
      valor,
      desc,
    ]);

    await conexao.commit();
    return res
      .status(200)
      .json({ mensagem: "Transferência realizada com sucesso!" });
  } catch (erro) {
    await conexao.rollback();
    console.error("Erro na transferência:", erro);
    return res
      .status(500)
      .json({ erro: "Erro interno ao realizar transferência." });
  } finally {
    if (conexao) conexao.release();
  }
};

const pagar = async (req, res) => {
  const conexao = await pool.getConnection();

  try {
    const { contaOrigemId, valor, descricao } = req.body;

    if (valor <= 0) {
      conexao.release();
      return res
        .status(400)
        .json({ erro: "O valor do pagamento deve ser maior que zero." });
    }

    await conexao.beginTransaction();

    const [resultadoOrigem] = await conexao.execute(
      `SELECT saldo FROM contas WHERE id = ?`,
      [contaOrigemId],
    );

    if (resultadoOrigem.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ erro: "Conta não encontrada." });
    }

    const saldoOrigem = parseFloat(resultadoOrigem[0].saldo);

    if (saldoOrigem < valor) {
      await conexao.rollback();
      return res
        .status(400)
        .json({ erro: "Saldo insuficiente para realizar este pagamento." });
    }

    await conexao.execute(`UPDATE contas SET saldo = saldo - ? WHERE id = ?`, [
      valor,
      contaOrigemId,
    ]);

    const queryExtrato = `
            INSERT INTO transacoes (conta_origem_id, tipo, valor, descricao) 
            VALUES (?, 'SAIDA_EXTERNA', ?, ?)
        `;
    const desc = descricao || "Pagamento externo realizado";
    await conexao.execute(queryExtrato, [contaOrigemId, valor, desc]);

    await conexao.commit();
    return res
      .status(200)
      .json({ mensagem: "Pagamento processado com sucesso!" });
  } catch (erro) {
    await conexao.rollback();
    console.error("Erro no pagamento:", erro);
    return res
      .status(500)
      .json({ erro: "Erro interno ao processar pagamento." });
  } finally {
    if (conexao) conexao.release();
  }
};

module.exports = { depositar, transferir, pagar };
