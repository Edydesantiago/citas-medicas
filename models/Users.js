// models/Users.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const generateApiKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = '';
  for (let i = 0; i < 15; i++) {
    apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return apiKey;
};

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['paciente', 'medico'], required: true },
  api_key: { type: String, unique: true, default: generateApiKey },
  saldo: { type: Number, default: 5 }  // Puedes usarlo para limitar operaciones, si lo deseas
});

module.exports = mongoose.model('User', UserSchema);
