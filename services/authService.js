// authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado" });
  }
  try {
    const user = jwt.verify(token, 'tu-palabra-secreta');
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Token inválido", error: error.message });
  }
};

module.exports = authenticateJWT;
