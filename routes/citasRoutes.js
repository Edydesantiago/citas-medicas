const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const authenticateJWT = require('../authMiddleware');

router.use(authenticateJWT); // Todas las rutas requieren autenticación


/**
 * @swagger
 * /api/citas:
 *   get:
 *     summary: Obtener todas las citas
 *     description: Permite obtener la lista completa de citas.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citas obtenida correctamente
 *       401:
 *         description: No autorizado (requiere token)
 */
router.get('/', citasController.list);
/**
 * @swagger
 * /api/citas:
 *   post:
 *     summary: Crear una nueva cita
 *     description: Un paciente agenda una cita con un médico.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medico:
 *                 type: string
 *                 example: "ID_DEL_MEDICO"
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-01T10:00:00Z"
 *               motivo:
 *                 type: string
 *                 example: "Consulta general"
 *     responses:
 *       201:
 *         description: Cita creada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', citasController.create);

/**
 * @swagger
 * /api/citas/{id}:
 *   put:
 *     summary: Actualizar una cita existente
 *     description: Permite modificar los detalles de una cita programada.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "ID_DE_LA_CITA"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-01T11:00:00Z"
 *               motivo:
 *                 type: string
 *                 example: "Cambio de horario"
 *     responses:
 *       200:
 *         description: Cita actualizada correctamente
 *       404:
 *         description: Cita no encontrada
 */
router.put('/:id', citasController.update);

/**
 * @swagger
 * /api/citas/{id}:
 *   delete:
 *     summary: Cancelar una cita médica
 *     description: Permite cancelar una cita previamente agendada.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "ID_DE_LA_CITA"
 *     responses:
 *       200:
 *         description: Cita cancelada correctamente
 *       404:
 *         description: Cita no encontrada
 */
router.delete('/:id', citasController.cancel);

/**
 * @swagger
 * /api/citas/mis-citas:
 *   get:
 *     summary: Obtener citas del usuario autenticado
 *     description: Los pacientes ven sus citas y los médicos ven sus consultas programadas.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citas obtenida correctamente
 *       401:
 *         description: No autorizado (requiere token)
 */
router.get('/mis-citas', citasController.listByUser);

module.exports = router;
