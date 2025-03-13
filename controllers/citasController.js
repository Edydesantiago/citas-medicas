const Cita = require('../models/Citas');
const User = require('../models/Users'); // Necesario para validar que el médico existe
const mongoose = require('mongoose');

//lista
exports.list = async function (req, res) {
  try {
    const citas = await Cita.find(); // Obtener todas las citas de la base de datos
    return res.json({ citas, message: "Lista de citas obtenida correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las citas", error: error.message });
  }
};


// Crear una nueva cita
exports.create = async function (req, res) {
  const { medico, fecha, motivo } = req.body;
  const paciente = req.user.id; // El paciente autenticado

  if (!medico || !fecha) {
    return res.status(400).json({ message: "Faltan datos obligatorios (medico y fecha)" });
  }

  // Validar que "medico" sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(medico)) {
    return res.status(400).json({ message: "El ID del médico no es válido" });
  }

  try {
    // Verificar que el médico existe y tiene el rol correcto
    const medicoEncontrado = await User.findById(medico);
    if (!medicoEncontrado || medicoEncontrado.rol !== 'medico') {
      return res.status(404).json({ message: "El médico especificado no existe o no tiene el rol correcto" });
    }

    // Validar que la fecha no sea en el pasado
    const fechaCita = new Date(fecha);
    const ahora = new Date();
    if (fechaCita < ahora) {
      return res.status(400).json({ message: "No puedes agendar una cita en el pasado" });
    }

    // Crear y guardar la cita
    const cita = new Cita({ paciente, medico, fecha, motivo });
    await cita.save();

    return res.status(201).json({ cita, message: "Cita creada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la cita", error: error.message });
  }
};

// Actualizar una cita
exports.update = async function (req, res) {
  const { id } = req.params;
  const updates = req.body;
  const usuarioId = req.user.id;
  const usuarioRol = req.user.rol;

  try {
    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // Solo el médico asignado puede modificar la cita
    if (usuarioRol !== "medico" || cita.medico.toString() !== usuarioId) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta cita" });
    }

    // Aplicar actualizaciones y guardar
    Object.assign(cita, updates);
    await cita.save();

    return res.json({ cita, message: "Cita actualizada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la cita", error: error.message });
  }
};

// Cancelar una cita
exports.cancel = async function (req, res) {
  const { id } = req.params;
  const usuarioId = req.user.id;
  const usuarioRol = req.user.rol;

  try {
    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // Solo el paciente o el médico pueden cancelar la cita
    if (cita.paciente.toString() !== usuarioId && cita.medico.toString() !== usuarioId) {
      return res.status(403).json({ message: "No tienes permiso para cancelar esta cita" });
    }

    // Cambiar estado a cancelada
    cita.estado = 'cancelada';
    await cita.save();

    return res.json({ cita, message: "Cita cancelada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al cancelar la cita", error: error.message });
  }
};

// Obtener citas de un usuario (paciente o médico)
exports.listByUser = async function (req, res) {
  const userId = req.user.id;
  const rol = req.user.rol;

  try {
    let citas;
    if (rol === 'paciente') {
      citas = await Cita.find({ paciente: userId }).populate('medico', 'email rol');
    } else if (rol === 'medico') {
      citas = await Cita.find({ medico: userId }).populate('paciente', 'email rol');
    } else {
      return res.status(403).json({ message: "No tienes permiso para ver citas" });
    }

    return res.json({ citas });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener citas", error: error.message });
  }

  
};
