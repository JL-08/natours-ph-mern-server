const swaggerAutogen = require('swagger-autogen')();

const port = process.env.PORT || 5000;

const doc = {
  info: {
    title: 'Natours',
    description: 'API endpoints of Natours Website',
  },
  host: `localhost:${port}`,
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server.js');
});
