// controllers/usersController.js
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

exports.register = async function(req, res) {
  const { email, password, rol } = req.body;
  if (!email || !password || !rol) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }
    const user = new User({ email, password, rol });
    await user.save();
    return res.status(201).json({ user, message: "Usuario creado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al guardar usuario", error: error.message });
  }
};

exports.login = async function(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).json({ message: "Credenciales inválidas" });
    }
    
    // ✅ Incluir el ID del usuario en el token
    const token = jwt.sign(
      { id: user._id, email: user.email, api_key: user.api_key, rol: user.rol },
      'tu-palabra-secreta',
      { expiresIn: '1h' }
    );

    return res.json({ token, message: "El token será válido por 1 hora" });
  } catch (error) {
    return res.status(500).json({ message: "Error en la autenticación", error: error.message });
  }
};
