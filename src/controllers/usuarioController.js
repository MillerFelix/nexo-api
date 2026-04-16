const bcrypt = require("bcrypt");
const pool = require("../../database");

const criarUsuario = async (req, res) => {
  const conexao = await pool.getConnection();

  try {
    const { nome, cpf, email, telefone, endereco, senha } = req.body;

    if (!nome || !cpf || !email || !senha) {
      conexao.release();
      return res
        .status(400)
        .json({ erro: "Nome, CPF, Email e Senha são obrigatórios." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await conexao.beginTransaction();

    const queryUsuario = `
            INSERT INTO usuarios (nome, cpf, email, telefone, endereco, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    const valoresUsuario = [nome, cpf, email, telefone, endereco, senhaHash];
    const [resultadoUsuario] = await conexao.execute(
      queryUsuario,
      valoresUsuario,
    );

    const usuarioId = resultadoUsuario.insertId; // Pegamos o ID do usuário recém-criado

    const numeroConta = Math.floor(100000 + Math.random() * 900000).toString();

    const queryConta = `
            INSERT INTO contas (usuario_id, numero_conta)
            VALUES (?, ?)
        `;
    const valoresConta = [usuarioId, numeroConta];
    await conexao.execute(queryConta, valoresConta);

    await conexao.commit();

    return res.status(201).json({
      mensagem: "Usuário e Conta criados com sucesso!",
      usuario: {
        id: usuarioId,
        nome: nome,
      },
      conta: {
        numero: numeroConta,
        agencia: "0001",
        saldo: 0.0,
      },
    });
  } catch (erro) {
    await conexao.rollback();
    console.error("Erro ao criar usuário e conta:", erro);

    if (erro.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ erro: "CPF ou Email já cadastrados no sistema." });
    }

    return res.status(500).json({ erro: "Erro interno do servidor." });
  } finally {
    if (conexao) conexao.release();
  }
};

module.exports = { criarUsuario };
