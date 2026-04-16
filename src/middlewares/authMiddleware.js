const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ erro: "Token não fornecido. Acesso negado." });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ erro: "Erro no formato do token." });
  }

  const token = partes[1];

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuarioIdLogado = decodificado.usuarioId;

    return next();
  } catch (erro) {
    return res
      .status(401)
      .json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};

module.exports = { verificarToken };
