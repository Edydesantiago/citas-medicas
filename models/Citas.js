// models/Citas.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CitaSchema = new Schema({
  paciente: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medico: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, required: true },
  motivo: { type: String },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Cita', CitaSchema);

