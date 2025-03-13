const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        // Si el token comienza con "Bearer ", lo eliminamos
        const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;
        
        // Decodificamos el token
        const decoded = jwt.verify(tokenWithoutBearer, 'tu-palabra-secreta'); 
        
        // Asignamos el usuario decodificado a req.user
        req.user = decoded;

        console.log("Usuario autenticado:", req.user); // 🔍 Verificar en consola

        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido", error: error.message });
    }
};

module.exports = authenticateJWT;
