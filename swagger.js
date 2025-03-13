const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
        title: 'API de Gestión de Citas Médicas',
        description: 'API para agendar, modificar, cancelar y consultar citas médicass',
        version: '1.0.0',
        termsOfService: "http://localhost:3000/terms",
contact: {
    name: "EDY DE SANTIAGO",
    email: "edydesantiago@gmail.com",
    url: "http://localhost:3000/welcome"
}
        },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']  // Asegúrate de que esté buscando todas las rutas
};

const swaggerDocs = swaggerJSDoc(options);

module.exports = swaggerDocs;

