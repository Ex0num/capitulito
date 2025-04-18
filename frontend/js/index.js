console.log("✅ Script cargado correctamente desde index.js");

document.addEventListener('keydown', function (event) 
{
    if (event.key === 'Escape') 
    {
        document.getElementById("resultados-busqueda").style.display = 'none';
    }
});

document.addEventListener("click", function (event) 
{
    const buscador = document.getElementById("header-buscador");
    const resultados = document.getElementById("resultados-busqueda");

    if (!buscador.contains(event.target) && !resultados.contains(event.target)) 
    {
        resultados.style.display = "none";
    }
});

function mostrarSkeletons(contenedorId, cantidad = 5) 
{
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';

    contenedor.scrollLeft = 0;

    for (let i = 0; i < cantidad; i++) 
    {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        contenedor.appendChild(skeleton);
    }
}

function eliminarSkeletons(contenedorId) 
{
    const contenedor = document.getElementById(contenedorId);
    const skeletons = contenedor.querySelectorAll('.skeleton-card');
    skeletons.forEach(s => s.remove());
}

function moverCarrusel(id, direccion) 
{
    const contenedor = document.getElementById(id);
    const card = contenedor.querySelector('.card');
    const cantidadCards = 3; // o 2, 4, lo que quieras
    const scrollAmount = (card.offsetWidth + 16) * cantidadCards;
    
    contenedor.scrollBy({
        left: direccion * scrollAmount,
        behavior: 'smooth'
    });
}

function extraerIdDesdeUrl(url) 
{
    const match = url.match(/\/title\/(tt\d+)\//);
    return match ? match[1] : null;
}
 
let timeoutBusqueda = null;

document.getElementById("input-buscador").addEventListener("input", function (e) 
{
    const texto = e.target.value.trim();
    const lupa = document.getElementById("icono-lupa");
    const loader = document.getElementById("icono-loader");

    clearTimeout(timeoutBusqueda);

    if (texto === "") 
    {
        document.getElementById("resultados-busqueda").style.display = 'none';
        lupa.style.display = "inline-block";
        loader.style.display = "none";
        return;
    }

    lupa.style.display = "none";
    loader.style.display = "inline-block";

    timeoutBusqueda = setTimeout(() => 
    {
        buscarPeliculas(texto);
    }, 2000);
});

async function buscarPeliculas(nombre) 
{
    if (!nombre || nombre.trim() === "") 
    {
        console.warn("Busqueda ignorada: string vacío o undefined.");
        return;
    }

    const lupa = document.getElementById("icono-lupa");
    const loader = document.getElementById("icono-loader");

    try 
    {
        console.log(`Buscando: ${nombre}...`);
        const response = await fetch(`http://localhost:3101/api/movies/search?q=${encodeURIComponent(nombre)}`);
        const data = await response.json();

        if (data.hubo_error) 
        {
            console.error("❌ Error en búsqueda:", data.msj_a_mostrar);
            return;
        }

        mostrarResultadosDeBusqueda(data.content);
    } 
    catch (error) 
    {
        console.error("❌ Error en fetch de búsqueda:", error);
    } 
    finally 
    {
        lupa.style.display = "inline-block";
        loader.style.display = "none";
    }
}

function mostrarResultadosDeBusqueda(resultados) 
{
    const contenedor = document.getElementById("resultados-busqueda");
    contenedor.innerHTML = "";
    contenedor.style.display = "block";

    if (!resultados || resultados.length === 0) 
    {
        contenedor.innerHTML =` 
            <div style="color: #ccc; text-align: center; padding: 1rem;">
                <h6>😕 No se encontraron coincidencias.</h6>
            </div>`
        ;
        return;
    }

    resultados.forEach(item => {
        const div = document.createElement("div");
        div.className = "resultado-card";

        const tipo = item['@type'] === 'TV series' ? 'tv' : 'movie';
        console.log(item);
        div.onclick = () => reproducir(item.id, tipo);

        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="resultado-info">
                <h6>${item.title}</h6>
                <p><small>📅 ${item.year} - 🎭 ${item.cast}</small></p>
            </div>`
        ;

        contenedor.appendChild(div);
    });
}

function reproducir(imdbId, tipo = "movie") 
{

    //--- Guardar el ID y el tipo en localStorage ---//
    localStorage.setItem("contenidoSeleccionado", JSON.stringify(
    {
        id: imdbId,
        type: tipo
    }));

    window.location.href = "reproductor.html";
}

//---------------------------------- Obtencion de contenido ----------------------------------//

//--- TOP 250 Peliculas ---//
let peliculasTop250 = [];
let indicePeliculasCargadas = 0;
const cantidadPorCarga = 10;

function cargarMasPeliculasEnCarrusel() 
{
    const contenedorCarrusel = document.getElementById("populares");

    //--- Eliminamos los skeletons si están presentes ---//
    eliminarSkeletons("populares");

    const peliculasPorMostrar = peliculasTop250.slice(indicePeliculasCargadas, indicePeliculasCargadas + cantidadPorCarga);

    peliculasPorMostrar.forEach(pelicula => 
    {
        const card = document.createElement("div");
        card.className = "card me-3";

        card.innerHTML = `
            <img src="${pelicula.image}" class="card-img-top" alt="${pelicula.name}">
            <div class="card-body">
                <h6 class="card-title">${pelicula.name}</h6>
                <p class="card-text"><small>${pelicula.genre}</small></p>
            </div>`
        ;

        const id = extraerIdDesdeUrl(pelicula.url);
        card.onclick = () => reproducir(id, 'movie');
        contenedorCarrusel.appendChild(card);
    });

    indicePeliculasCargadas += cantidadPorCarga;
}

async function cargarPeliculasTop250EnCarrusel() 
{
    try 
    {
        mostrarSkeletons("populares");
        const response = await fetch("http://localhost:3101/api/movies/best-250-movies");
        const data = await response.json();

        if (data.hubo_error) 
        {
            console.error("❌ Error al obtener películas:", data.msj_a_mostrar);
            return;
        }

        peliculasTop250 = data.content;
        indicePeliculasCargadas = 0;
        cargarMasPeliculasEnCarrusel();
    } 
    catch (error) 
    {
        console.error("❌ Error en el fetch:", error);
    }
}

const carrusel = document.getElementById("populares");
carrusel.addEventListener('scroll', () => 
{
    if (carrusel.scrollLeft + carrusel.offsetWidth >= carrusel.scrollWidth - 50) 
    {
        if (indicePeliculasCargadas < peliculasTop250.length) 
        {
            console.log("Cargando mas peliculas (Best 250)");
            cargarMasPeliculasEnCarrusel();
        }
    }
});

cargarPeliculasTop250EnCarrusel();


//--- TOP MasPopulares Peliculas ---//
let popularesPeliculas = [];
let indexPopularesPeliculas = 0;

async function cargarPeliculasPopularesEnCarrusel() 
{
    try 
    {
        mostrarSkeletons("valoradas");
        const response = await fetch("http://localhost:3101/api/movies/most-popular-movies");
        const data = await response.json();
        if (data.hubo_error) 
        {
            console.error("❌ Error al obtener películas populares:", data.msj_a_mostrar);
        } 
        else 
        {
            popularesPeliculas = data.content;
            indexPopularesPeliculas = 0;
            cargarSiguienteLotePopulares();
        }
    } 
    catch (error) 
    {
        console.error("❌ Error en fetch de películas populares:", error);
    }
}

function cargarSiguienteLotePopulares() 
{
    const contenedor = document.getElementById("valoradas");
    const cantidad = 10;

    eliminarSkeletons("valoradas")

    const lote = popularesPeliculas.slice(indexPopularesPeliculas, indexPopularesPeliculas + cantidad);

    lote.forEach(pelicula => 
    {
        const card = document.createElement("div");
        card.className = "card bg-dark text-white me-3 movie-card-overlay card-carrusel-grande";
        card.style.minWidth = "400px";
        card.style.maxWidth = "500px";
        card.style.border = "none";

        card.innerHTML = `
        <img src="${pelicula.image}" class="card-img-carrusel-grande" alt="${pelicula.name}">
        <div class="card-img-overlay d-flex flex-column justify-content-end p-3" style="background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);">
            <h5 class="card-title mb-1">${pelicula.name}</h5>
            <p class="card-text mb-0"><small>⭐ ${pelicula.aggregateRating?.ratingValue || "?"} - ${pelicula.genre}</small></p>
            <p class="card-text descripcion-limitada"><small>${pelicula.description || "Sin descripción disponible."}</small></p>
        </div>`
        ;
        const id = extraerIdDesdeUrl(pelicula.url);
        card.onclick = () => reproducir(id, 'movie');
        contenedor.appendChild(card);
    });

    indexPopularesPeliculas += cantidad;
}

const valoradasCarrusel = document.getElementById("valoradas");
valoradasCarrusel.addEventListener("scroll", () => 
{
    if (valoradasCarrusel.scrollLeft + valoradasCarrusel.clientWidth >= valoradasCarrusel.scrollWidth - 10) 
    {
        if (indexPopularesPeliculas < popularesPeliculas.length)     
        {
            console.log("Cargando mas peliculas (Most popular)");
            cargarSiguienteLotePopulares();
        }
    }
});

cargarPeliculasPopularesEnCarrusel();


//--- TOP Series Populares ---//
let seriesPopulares = [];
let indexSeriesPopulares = 0;

async function cargarSeriesPopularesEnCarrusel() 
{
    try 
    {
        mostrarSkeletons("recomendadas");
        const response = await fetch("http://localhost:3101/api/movies/most-popular-series");
        const data = await response.json();

        if (data.hubo_error) 
        {
            console.error("❌ Error al obtener series populares:", data.msj_a_mostrar);
        } 
        else 
        {
            seriesPopulares = data.content;
            indexSeriesPopulares = 0;
            cargarSiguienteLoteSeriesPopulares();
        }
    } 
    catch (error) 
    {
        console.error("❌ Error en fetch de series populares:", error);
    }
}

function cargarSiguienteLoteSeriesPopulares() 
{
    const contenedor = document.getElementById("recomendadas");
    const cantidad = 10;

    eliminarSkeletons("recomendadas")

    const lote = seriesPopulares.slice(indexSeriesPopulares, indexSeriesPopulares + cantidad);

    lote.forEach(serie => 
    {
        const card = document.createElement("div");
        card.className = "card me-3 movie-card-overlay card-carrusel-grande";
        card.style.minWidth = "300px";
        card.style.maxWidth = "300px";
        card.style.border = "none";

        card.innerHTML = `
            <img src="${serie.image}" class="card-img-carrusel-grande" alt="${serie.name}">
            <div class="card-img-overlay d-flex flex-column justify-content-end p-3"
                style="background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);">
                <h6 class="card-title">${serie.name}</h6>
                <small>⭐ ${serie.aggregateRating?.ratingValue || "?"}</small>
                <small class="descripcion-limitada">${serie.description || "Sin descripción disponible."}</small>
            </div>`
        ;
        const id = extraerIdDesdeUrl(serie.url);
        card.onclick = () => reproducir(id, 'tv');
        contenedor.appendChild(card);
    });

    indexSeriesPopulares += cantidad;
}

const recomendadasCarrusel = document.getElementById("recomendadas");
recomendadasCarrusel.addEventListener("scroll", () => 
{
    if (recomendadasCarrusel.scrollLeft + recomendadasCarrusel.clientWidth >= recomendadasCarrusel.scrollWidth - 10) 
    {
        if (indexSeriesPopulares < seriesPopulares.length) 
        {
            console.log("Cargando mas series (Most popular)...");
            cargarSiguienteLoteSeriesPopulares();
        }
    }
});

cargarSeriesPopularesEnCarrusel();


//--- TOP Series Top 250 ---//
//--- TOP Series Top 250 (con imagen + texto plano) ---//
let seriesTopTexto = [];
let indexSeriesTopTexto = 0;

async function cargarSeriesTopTexto() 
{
    try 
    {
        mostrarSkeletons("topseries");
        const response = await fetch("http://localhost:3101/api/movies/best-250-series");
        const data = await response.json();

        if (data.hubo_error) 
        {
            console.error("❌ Error al obtener series top 250:", data.msj_a_mostrar);
        } 
        else 
        {
            seriesTopTexto = data.content;
            indexSeriesTopTexto = 0;
            cargarLoteSeriesTopTexto();
        }
    } 
    catch (error) 
    {
        console.error("❌ Error en fetch de series top 250:", error);
    }
}

function cargarLoteSeriesTopTexto() 
{
    const contenedor = document.getElementById("topseries");
    const cantidad = 10;

    eliminarSkeletons("topseries")

    const lote = seriesTopTexto.slice(indexSeriesTopTexto, indexSeriesTopTexto + cantidad);

    lote.forEach(serie => 
    {
        const card = document.createElement("div");
        card.className = "card me-3";
        card.style.minWidth = "250px";
        card.style.maxWidth = "250px";
        card.style.backgroundColor = "#262629";
        card.style.color = "white";
        card.style.border = "none";

        card.innerHTML = `
            <img src="${serie.image}" class="card-img-top" style="min-height: 350px; max-height: 350px;" alt="${serie.name}">
            <div class="card-body">
                <h6 class="card-title mb-2">${serie.name}</h6>
                <p class="card-text descripcion-limitada"><small>${serie.description || "Sin descripción disponible."}</small></p>
            </div>`
        ;
        const id = extraerIdDesdeUrl(serie.url);
        card.onclick = () => reproducir(id, 'tv');
        contenedor.appendChild(card);
    });

    indexSeriesTopTexto += cantidad;
}

const topSeriesCarrusel = document.getElementById("topseries");
topSeriesCarrusel.addEventListener("scroll", () => 
{
    if (topSeriesCarrusel.scrollLeft + topSeriesCarrusel.clientWidth >= topSeriesCarrusel.scrollWidth - 10) 
    {
        if (indexSeriesTopTexto < seriesTopTexto.length) 
        {
            console.log("Cargando mas series (Best 250)...");
            cargarLoteSeriesTopTexto();
        }
    }
});

cargarSeriesTopTexto();