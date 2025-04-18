const {Router} = require("express");
const peliculasController = require('../controllers/movies.controller');
const playerRoutes = Router();

playerRoutes.get('/best-250-movies', peliculasController.obtener_mejores_250_peliculas);
playerRoutes.get('/most-popular-movies', peliculasController.obtener_mas_populares_peliculas);
playerRoutes.get('/best-250-series', peliculasController.obtener_mejores_250_series);
playerRoutes.get('/most-popular-series', peliculasController.obtener_mas_populares_series);
playerRoutes.get('/search', peliculasController.buscar_coincidencias);

module.exports = playerRoutes;