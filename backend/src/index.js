//--- Require de las dependencias necesarias ---//
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const pkg = require('../package.json');
const path = require('path');
require('dotenv').config({path: '.env'});

//--- Require de las rutas necesarias ---//
const peliculasRoutes = require('./routes/movies.routes.js');

//---------------------- Implementacion de Express e inyeccion de depencias -----------------------//
const app = express();

app.use(helmet()); //--- Establece encabezados HTTP de respuesta que ayudan a mitigar ataques de tipo Cross-Site Scripting (XSS), de inyección de contenido (CSP), de secuestro de clics (Clickjacking) ------//

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', "https://capitulito-frontend.vercel.app", "'https://capitulito-frontend.vercel.app'"],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
})); //---- CORS es una medida de seguridad que restringe cómo los recursos en una página web pueden ser solicitados desde otro dominio diferente al dominio de origen. Es útil cuando tu servidor Express necesita permitir solicitudes de recursos desde orígenes cruzados ---//

app.use(morgan('dev')); //--- Morgan muestra las solicitudes en consola. (DEV-PHASE ONLY) ---//
app.use(express.json()); //--- Define que express trabajara los datos como JSON ---//

//------------------------------- Endpoints -------------------------------//
app.set('pkg', pkg);
app.get('/', async (req, res) => {res.json({name: app.get('pkg').name, autor: app.get('pkg').author, descripcion: app.get('pkg').description, version: app.get('pkg').version,});});

//--- API ---//
app.use('/api/movies', peliculasRoutes);

// --- Port defined --- //
const PORT = process.env.port || 3101;
app.listen(PORT);

console.log('----- Server listening on port -----', PORT);