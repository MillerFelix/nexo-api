const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../database");

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }

    const query = `SELECT id, nome, senha_hash FROM usuarios WHERE email = ?`;
    const [resultado] = await pool.execute(query, [email]);

    if (resultado.length === 0) {
      return res.status(401).json({ erro: "Email ou senha inválidos." });
    }

    const usuario = resultado[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha inválidos." });
    }

    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    return res.status(500).json({ erro: "Erro interno ao realizar login." });
  }
};

module.exports = { login };
