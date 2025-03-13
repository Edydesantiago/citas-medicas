require('./config/db'); // Conexión a la base de datos
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const usersRoutes = require('./routes/usersRoutes');
const citasRoutes = require('./routes/citasRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Seguridad mejorada con middlewares
app.use(helmet()); // Protege las cabeceras HTTP
app.use(cors()); // Habilita CORS
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(xss()); // Previene ataques XSS
app.use(mongoSanitize()); // Evita inyección NoSQL
app.use(hpp()); // Evita la contaminación de parámetros HTTP

// 🔒 Rate Limiting - Protección contra ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 solicitudes por IP
  message: 'Has excedido el límite de solicitudes, por favor intenta nuevamente más tarde.'
});
app.use(limiter);

// Rutas
app.use('/api/users', usersRoutes);
app.use('/api/citas', citasRoutes);

// Documentación Swagger (configurado en swagger.js)
app.use('/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Gestión de Citas Médicas');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});




