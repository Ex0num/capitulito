const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const obtener_mejores_250_peliculas = async (req, res) => 
{
    let obj_response = { hubo_error: false, msj_a_mostrar: "", content: {} };

    try 
    {
        const response = await fetch("https://www.imdb.com/es/chart/top/?ref_=nv_mv_250");
        const html = await response.text();
        const $ = cheerio.load(html);
        let jsonPeliculas = null;

        $('script[type="application/ld+json"]').each((i, el) => 
        {
            const texto = $(el).html();
            if (texto.includes('"itemListElement"')) 
            {
                try 
                {
                    const parsed = JSON.parse(texto);
                    if (parsed.itemListElement) 
                    {
                        jsonPeliculas = parsed.itemListElement.map(entry => entry.item);
                    }
                } 
                catch (err)
                {
                    console.warn("Error parsing JSON block:", err);
                }
            }
        });

        if (!jsonPeliculas) throw new Error("No se encontró la lista de películas en el JSON");

        obj_response.msj_a_mostrar = "Best 250 movies obtained successfully.";
        obj_response.content = jsonPeliculas;

    } 
    catch (error) 
    {
        console.error(error);
        obj_response.hubo_error = true;
        obj_response.msj_a_mostrar = "Unexpected error while trying to get best 250 movies list.";
    }

    res.status(obj_response.hubo_error ? 500 : 200).json(obj_response);
};

const obtener_mejores_250_series = async (req, res) => 
{
    let obj_response = { hubo_error: false, msj_a_mostrar: "", content: {} };

    try 
    {
        const response = await fetch("https://www.imdb.com/es/chart/toptv/?ref_=nv_tvv_250");
        const html = await response.text();
        const $ = cheerio.load(html);
        let jsonSeries = null;

        $('script[type="application/ld+json"]').each((i, el) => 
        {
            const texto = $(el).html();
            if (texto.includes('"itemListElement"')) 
            {
                try 
                {
                    const parsed = JSON.parse(texto);
                    if (parsed.itemListElement) 
                    {
                        jsonSeries = parsed.itemListElement.map(entry => entry.item);
                    }
                } 
                catch (err)
                {
                    console.warn("Error parsing JSON block:", err);
                }
            }
        });

        if (!jsonSeries) throw new Error("No se encontró la lista de series en el JSON");

        obj_response.msj_a_mostrar = "Best 250 TV shows obtained successfully.";
        obj_response.content = jsonSeries;

    } 
    catch (error) 
    {
        console.error(error);
        obj_response.hubo_error = true;
        obj_response.msj_a_mostrar = "Unexpected error while trying to get best 250 TV shows list.";
    }

    res.status(obj_response.hubo_error ? 500 : 200).json(obj_response);
};

const obtener_mas_populares_peliculas = async (req, res) => 
{
    let obj_response = { hubo_error: false, msj_a_mostrar: "", content: [] };

    try 
    {
        const response = await fetch("https://www.imdb.com/es/chart/moviemeter/?ref_=nv_mv_mpm");
        const html = await response.text();
        const $ = cheerio.load(html);
        let jsonPeliculas = null;

        $('script[type="application/ld+json"]').each((i, el) => 
        {
            const texto = $(el).html();
            if (texto.includes('"itemListElement"')) 
            {
                try 
                {
                    const parsed = JSON.parse(texto);
                    if (parsed.itemListElement) 
                    {
                        jsonPeliculas = parsed.itemListElement.map(entry => entry.item);
                    }
                } 
                catch (err) 
                {
                    console.warn("Error parsing JSON block:", err);
                }
            }
        });

        if (!jsonPeliculas) throw new Error("No se encontró la lista de películas populares");

        obj_response.msj_a_mostrar = "Most popular movies obtained successfully.";
        obj_response.content = jsonPeliculas;

    } 
    catch (error) 
    {
        console.error(error);
        obj_response.hubo_error = true;
        obj_response.msj_a_mostrar = "Unexpected error while trying to get most popular movies.";
    }

    res.status(obj_response.hubo_error ? 500 : 200).json(obj_response);
};

const obtener_mas_populares_series = async (req, res) => 
{
    let obj_response = { hubo_error: false, msj_a_mostrar: "", content: [] };

    try 
    {
        const response = await fetch("https://www.imdb.com/es/chart/tvmeter/?ref_=nv_tvv_mptv");
        const html = await response.text();
        const $ = cheerio.load(html);
        let jsonSeries = null;

        $('script[type="application/ld+json"]').each((i, el) => 
        {
            const texto = $(el).html();
            if (texto.includes('"itemListElement"')) 
            {
                try 
                {
                    const parsed = JSON.parse(texto);
                    if (parsed.itemListElement) 
                    {
                        jsonSeries = parsed.itemListElement.map(entry => entry.item);
                    }
                } 
                catch (err)
                {
                    console.warn("Error parsing JSON block:", err);
                }
            }
        });

        if (!jsonSeries) throw new Error("No se encontró la lista de series populares");

        obj_response.msj_a_mostrar = "Most popular series obtained successfully.";
        obj_response.content = jsonSeries;

    } 
    catch (error) 
    {
        console.error(error);
        obj_response.hubo_error = true;
        obj_response.msj_a_mostrar = "Unexpected error while trying to get most popular series.";
    }

    res.status(obj_response.hubo_error ? 500 : 200).json(obj_response);
};

const buscar_coincidencias = async (req, res) => {
    const query = req.query.q;
    let obj_response = { hubo_error: false, msj_a_mostrar: "", content: [] };

    try {
        if (!query || query.trim() === "") {
            obj_response.hubo_error = true;
            obj_response.msj_a_mostrar = "Parámetro de búsqueda vacío.";
            return res.status(400).json(obj_response);
        }

        const response = await fetch(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(query)}.json`);
        const data = await response.json();

        const resultados = (data.d || [])
            .filter(item =>
                item.id &&
                !item.id.startsWith("nm") &&
                !item.id.startsWith("/comic-con") &&
                !item.id.startsWith("/originals") &&
                (item.q === "feature" || item.q === "TV series")
            )
            .map(item => ({
                id: item.id,
                title: item.l,
                image: item.i?.imageUrl,
                year: item.y,
                cast: item.s,
                type: item.q
            }));

        obj_response.content = resultados;
        obj_response.msj_a_mostrar = "Búsqueda realizada correctamente.";
    } catch (error) {
        console.error("❌ Error en búsqueda IMDb:", error);
        obj_response.hubo_error = true;
        obj_response.msj_a_mostrar = "Error al buscar en IMDb.";
    }

    res.status(obj_response.hubo_error ? 500 : 200).json(obj_response);
};

module.exports = { obtener_mejores_250_peliculas, obtener_mejores_250_series, obtener_mas_populares_peliculas, obtener_mas_populares_series, buscar_coincidencias };